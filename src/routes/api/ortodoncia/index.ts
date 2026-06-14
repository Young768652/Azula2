import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { tratamientosOrtodoncia, pacientes } from '../../../../db/schema.js'
import { eq, desc } from 'drizzle-orm'

export const Route = createFileRoute('/api/ortodoncia/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const rows = await db
            .select({
              id: tratamientosOrtodoncia.id,
              costoTotal: tratamientosOrtodoncia.costoTotal,
              cuotasPactadas: tratamientosOrtodoncia.cuotasPactadas,
              saldoPendiente: tratamientosOrtodoncia.saldoPendiente,
              tipoArcoActual: tratamientosOrtodoncia.tipoArcoActual,
              activo: tratamientosOrtodoncia.activo,
              creadoEn: tratamientosOrtodoncia.creadoEn,
              pacienteId: tratamientosOrtodoncia.pacienteId,
              pacienteNombre: pacientes.nombreCompleto,
              pacienteDni: pacientes.dni,
            })
            .from(tratamientosOrtodoncia)
            .innerJoin(pacientes, eq(tratamientosOrtodoncia.pacienteId, pacientes.id))
            .orderBy(desc(tratamientosOrtodoncia.creadoEn))
          return Response.json(rows)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { pacienteId, costoTotal, cuotasPactadas, tipoArcoActual } = body
          if (!pacienteId || !costoTotal || !cuotasPactadas) {
            return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
          }
          const [row] = await db
            .insert(tratamientosOrtodoncia)
            .values({
              pacienteId: parseInt(pacienteId),
              costoTotal: costoTotal.toString(),
              cuotasPactadas: parseInt(cuotasPactadas),
              saldoPendiente: costoTotal.toString(),
              tipoArcoActual,
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
