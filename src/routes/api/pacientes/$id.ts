import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { pacientes } from '../../../../db/schema.js'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/pacientes/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [row] = await db.select().from(pacientes).where(eq(pacientes.id, parseInt(params.id)))
        if (!row) return Response.json({ error: 'No encontrado' }, { status: 404 })
        return Response.json(row)
      },
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json()
          const { nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes } = body
          const [row] = await db
            .update(pacientes)
            .set({ nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes, actualizadoEn: new Date() })
            .where(eq(pacientes.id, parseInt(params.id)))
            .returning()
          if (!row) return Response.json({ error: 'No encontrado' }, { status: 404 })
          return Response.json(row)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        try {
          await db.delete(pacientes).where(eq(pacientes.id, parseInt(params.id)))
          return new Response(null, { status: 204 })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
    },
  },
})
