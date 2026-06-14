import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { pacientes, citas, pagos } from '../../../db/schema.js'

export const Route = createFileRoute('/api/seed')({
  server: {
    handlers: {
      POST: async () => {
        try {
          // Seed demo patients
          const demoPacientes = [
            { nombreCompleto: 'Ana García Torres', dni: '45678901', celular: '987654321', correo: 'ana@email.com', direccion: 'Av. Larco 120, Miraflores', fechaNacimiento: '1992-03-15', antecedentes: 'Alergia a la penicilina' },
            { nombreCompleto: 'Carlos Mendoza Ríos', dni: '32145678', celular: '976543210', correo: 'carlos@email.com', direccion: 'Jr. Puno 456, Lima', fechaNacimiento: '1985-07-22', antecedentes: null },
            { nombreCompleto: 'María Fernández López', dni: '56789012', celular: '965432109', correo: 'maria@email.com', direccion: 'Calle Los Olivos 89, San Isidro', fechaNacimiento: '1998-11-08', antecedentes: 'Diabetes tipo 2' },
            { nombreCompleto: 'Luis Herrera Villanueva', dni: '23456789', celular: '954321098', correo: null, direccion: 'Av. Universitaria 567, Los Olivos', fechaNacimiento: '1978-05-30', antecedentes: null },
            { nombreCompleto: 'Rosa Palomino Chávez', dni: '67890123', celular: '943210987', correo: 'rosa@email.com', direccion: 'Jr. Callao 234, Cercado de Lima', fechaNacimiento: '2001-09-14', antecedentes: null },
          ]

          const insertedPacientes = []
          for (const p of demoPacientes) {
            const [row] = await db.insert(pacientes).values(p).onConflictDoNothing().returning()
            if (row) insertedPacientes.push(row)
          }

          if (insertedPacientes.length > 0) {
            const today = new Date().toISOString().split('T')[0]
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
            const pid1 = insertedPacientes[0]?.id
            const pid2 = insertedPacientes[1]?.id
            const pid3 = insertedPacientes[2]?.id

            if (pid1) {
              await db.insert(citas).values([
                { pacienteId: pid1, fecha: today, hora: '09:00', especialidad: 'ortodoncia', estado: 'programada' },
                { pacienteId: pid2 ?? pid1, fecha: today, hora: '10:30', especialidad: 'odontologia_general', estado: 'programada' },
                { pacienteId: pid3 ?? pid1, fecha: today, hora: '11:00', especialidad: 'endodoncia', estado: 'programada' },
                { pacienteId: pid1, fecha: tomorrow, hora: '09:30', especialidad: 'ortodoncia', estado: 'programada' },
              ]).onConflictDoNothing()

              await db.insert(pagos).values([
                { pacienteId: pid1, concepto: 'Cuota Ortodoncia', monto: '250.00', tipoProcedimiento: 'fijo_ortodoncia', estado: 'pendiente' },
                { pacienteId: pid2 ?? pid1, concepto: 'Limpieza Dental', monto: '80.00', tipoProcedimiento: 'procedimiento_variable', estado: 'pagado', fechaPago: today },
                { pacienteId: pid3 ?? pid1, concepto: 'Consulta General', monto: '50.00', tipoProcedimiento: 'procedimiento_variable', estado: 'pendiente' },
              ]).onConflictDoNothing()
            }
          }

          return Response.json({ ok: true, message: 'Datos de demostración cargados' })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Error al cargar datos demo' }, { status: 500 })
        }
      },
    },
  },
})
