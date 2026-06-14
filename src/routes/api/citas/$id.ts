import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { citas } from '../../../../db/schema.js'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/citas/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json()
          const { pacienteId, fecha, hora, especialidad, estado, notas } = body
          const [row] = await db
            .update(citas)
            .set({ pacienteId, fecha, hora, especialidad, estado, notas })
            .where(eq(citas.id, parseInt(params.id)))
            .returning()
          return Response.json(row)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        await db.delete(citas).where(eq(citas.id, parseInt(params.id)))
        return new Response(null, { status: 204 })
      },
    },
  },
})
