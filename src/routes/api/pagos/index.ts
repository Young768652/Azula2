import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { pagos, pacientes } from '../../../../db/schema.js'
import { eq, desc, sum, count, gte, lte, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/pagos/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const tipo = url.searchParams.get('tipo') // 'reporte'

          const rows = await db
            .select({
              id: pagos.id,
              concepto: pagos.concepto,
              monto: pagos.monto,
              estado: pagos.estado,
              tipoProcedimiento: pagos.tipoProcedimiento,
              fechaPago: pagos.fechaPago,
              creadoEn: pagos.creadoEn,
              pacienteId: pagos.pacienteId,
              pacienteNombre: pacientes.nombreCompleto,
            })
            .from(pagos)
            .innerJoin(pacientes, eq(pagos.pacienteId, pacientes.id))
            .orderBy(desc(pagos.creadoEn))

          if (tipo === 'reporte') {
            // Monthly stats per month
            const stats = await db
              .select({
                mes: pagos.fechaPago,
                total: sum(pagos.monto),
                conteo: count(),
              })
              .from(pagos)
              .where(eq(pagos.estado, 'pagado'))
              .groupBy(pagos.fechaPago)
              .orderBy(pagos.fechaPago)

            // Tratamientos frecuentes
            const frecuentes = await db
              .select({
                concepto: pagos.concepto,
                conteo: count(),
                total: sum(pagos.monto),
              })
              .from(pagos)
              .groupBy(pagos.concepto)
              .orderBy(desc(count()))
              .limit(10)

            return Response.json({ rows, stats, frecuentes })
          }

          return Response.json(rows)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { pacienteId, concepto, monto, tipoProcedimiento } = body
          if (!pacienteId || !concepto || !monto) {
            return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
          }
          const [row] = await db
            .insert(pagos)
            .values({
              pacienteId: parseInt(pacienteId),
              concepto,
              monto: monto.toString(),
              tipoProcedimiento,
              estado: 'pendiente',
            })
            .returning()
          return Response.json(row, { status: 201 })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
    },
  },
})
