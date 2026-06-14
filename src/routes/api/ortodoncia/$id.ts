import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../db/index.js'
import { tratamientosOrtodoncia, notasEvolucion } from '../../../../db/schema.js'
import { eq, desc } from 'drizzle-orm'

export const Route = createFileRoute('/api/ortodoncia/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const [trat] = await db
            .select()
            .from(tratamientosOrtodoncia)
            .where(eq(tratamientosOrtodoncia.id, parseInt(params.id)))
          if (!trat) return Response.json({ error: 'No encontrado' }, { status: 404 })

          const notas = await db
            .select()
            .from(notasEvolucion)
            .where(eq(notasEvolucion.tratamientoId, parseInt(params.id)))
            .orderBy(desc(notasEvolucion.creadoEn))

          return Response.json({ ...trat, notas })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json()
          const { tipoArcoActual, activo } = body
          const [row] = await db
            .update(tratamientosOrtodoncia)
            .set({ tipoArcoActual, activo, actualizadoEn: new Date() })
            .where(eq(tratamientosOrtodoncia.id, parseInt(params.id)))
            .returning()
          return Response.json(row)
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
      POST: async ({ request, params }) => {
        // Add nota de evolución
        try {
          const body = await request.json()
          const { nota, arcoUsado, montoPagado } = body
          if (!nota) return Response.json({ error: 'Nota requerida' }, { status: 400 })

          const [notaRow] = await db
            .insert(notasEvolucion)
            .values({
              tratamientoId: parseInt(params.id),
              nota,
              arcoUsado,
              montoPagado: montoPagado ? montoPagado.toString() : null,
            })
            .returning()

          // Reduce saldo pendiente if payment was made
          if (montoPagado && parseFloat(montoPagado) > 0) {
            const [trat] = await db
              .select()
              .from(tratamientosOrtodoncia)
              .where(eq(tratamientosOrtodoncia.id, parseInt(params.id)))
            if (trat) {
              const nuevoSaldo = Math.max(
                0,
                parseFloat(trat.saldoPendiente as string) - parseFloat(montoPagado),
              )
              await db
                .update(tratamientosOrtodoncia)
                .set({ saldoPendiente: nuevoSaldo.toFixed(2), actualizadoEn: new Date() })
                .where(eq(tratamientosOrtodoncia.id, parseInt(params.id)))
            }
          }

          return Response.json(notaRow, { status: 201 })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error interno' }, { status: 500 })
        }
      },
    },
  },
})
