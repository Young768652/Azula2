import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { pacientes, citas, pagos, tratamientosOrtodoncia } from '../../../../db/schema.js'
import { eq, and, gte, lte, sum, count, sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/dashboard/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const today = new Date().toISOString().split('T')[0]
          const startOfMonth = today.slice(0, 8) + '01'
          const endOfMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          )
            .toISOString()
            .split('T')[0]

          const citasHoy = await db
            .select()
            .from(citas)
            .innerJoin(pacientes, eq(citas.pacienteId, pacientes.id))
            .where(and(eq(citas.fecha, today), eq(citas.estado, 'programada')))

          const pagosPendientes = await db
            .select()
            .from(pagos)
            .innerJoin(pacientes, eq(pagos.pacienteId, pacientes.id))
            .where(
              and(
                eq(pagos.estado, 'pendiente'),
                gte(pagos.creadoEn, new Date(startOfMonth)),
                lte(pagos.creadoEn, new Date(endOfMonth + 'T23:59:59')),
              ),
            )

          const tratamientosActivos = await db
            .select({ count: count() })
            .from(tratamientosOrtodoncia)
            .where(eq(tratamientosOrtodoncia.activo, true))

          const totalPendiente = pagosPendientes.reduce(
            (acc, p) => acc + parseFloat(p.pagos.monto as string),
            0,
          )

          const totalCobrado = await db
            .select({ total: sum(pagos.monto) })
            .from(pagos)
            .where(
              and(
                eq(pagos.estado, 'pagado'),
                gte(pagos.creadoEn, new Date(startOfMonth)),
                lte(pagos.creadoEn, new Date(endOfMonth + 'T23:59:59')),
              ),
            )

          return Response.json({
            citasHoy: citasHoy.map((r) => ({
              id: r.citas.id,
              hora: r.citas.hora,
              especialidad: r.citas.especialidad,
              estado: r.citas.estado,
              paciente: {
                id: r.pacientes.id,
                nombreCompleto: r.pacientes.nombreCompleto,
              },
            })),
            pagosPendientesMes: pagosPendientes.map((r) => ({
              id: r.pagos.id,
              concepto: r.pagos.concepto,
              monto: r.pagos.monto,
              paciente: {
                id: r.pacientes.id,
                nombreCompleto: r.pacientes.nombreCompleto,
              },
            })),
            totalPendienteMes: totalPendiente.toFixed(2),
            totalCobradoMes: parseFloat(totalCobrado[0]?.total ?? '0').toFixed(2),
            tratamientosActivos: tratamientosActivos[0]?.count ?? 0,
          })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
    },
  },
})
