import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { pagos } from '../../../../db/schema.js'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/pagos/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json()
          const { estado, fechaPago } = body
          const [row] = await db
            .update(pagos)
            .set({
              estado,
              fechaPago: estado === 'pagado' ? (fechaPago || new Date().toISOString().split('T')[0]) : null,
            })
            .where(eq(pagos.id, parseInt(params.id)))
            .returning()
          return Response.json(row)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        await db.delete(pagos).where(eq(pagos.id, parseInt(params.id)))
        return new Response(null, { status: 204 })
      },
    },
  },
})
