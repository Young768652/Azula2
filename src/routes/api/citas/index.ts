import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { citas, pacientes } from '../../../../db/schema.js'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

export const Route = createFileRoute('/api/citas/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const desde = url.searchParams.get('desde')
          const hasta = url.searchParams.get('hasta')

          let query = db
            .select({
              id: citas.id,
              fecha: citas.fecha,
              hora: citas.hora,
              especialidad: citas.especialidad,
              estado: citas.estado,
              notas: citas.notas,
              creadoEn: citas.creadoEn,
              pacienteId: citas.pacienteId,
              pacienteNombre: pacientes.nombreCompleto,
              pacienteCelular: pacientes.celular,
            })
            .from(citas)
            .innerJoin(pacientes, eq(citas.pacienteId, pacientes.id))
            .orderBy(citas.fecha, citas.hora)

          const rows = await query
          return Response.json(rows)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { pacienteId, fecha, hora, especialidad, notas } = body
          if (!pacienteId || !fecha || !hora || !especialidad) {
            return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
          }
          const [row] = await db
            .insert(citas)
            .values({ pacienteId: parseInt(pacienteId), fecha, hora, especialidad, notas, estado: 'programada' })
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
