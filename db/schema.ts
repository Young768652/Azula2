import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  date,
} from 'drizzle-orm/pg-core'

export const usuarios = pgTable('usuarios', {
  id: serial().primaryKey(),
  nombre: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  rol: text().notNull().default('recepcionista'), // administrador | odontologo | recepcionista
  activo: boolean().notNull().default(true),
  creadoEn: timestamp('creado_en').defaultNow(),
})

export const sesiones = pgTable('sesiones', {
  id: text().primaryKey(),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  expiraEn: timestamp('expira_en').notNull(),
  creadoEn: timestamp('creado_en').defaultNow(),
})

export const pacientes = pgTable('pacientes', {
  id: serial().primaryKey(),
  nombreCompleto: text('nombre_completo').notNull(),
  dni: text().notNull().unique(),
  celular: text(),
  correo: text(),
  direccion: text(),
  fechaNacimiento: date('fecha_nacimiento'),
  antecedentes: text(),
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
})

export const citas = pgTable('citas', {
  id: serial().primaryKey(),
  pacienteId: integer('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  fecha: date().notNull(),
  hora: text().notNull(),
  especialidad: text().notNull(), // odontologia_general | ortodoncia | endodoncia
  estado: text().notNull().default('programada'), // programada | reprogramada | cancelada | completada
  notas: text(),
  creadoEn: timestamp('creado_en').defaultNow(),
})

export const tratamientosOrtodoncia = pgTable('tratamientos_ortodoncia', {
  id: serial().primaryKey(),
  pacienteId: integer('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  costoTotal: numeric('costo_total', { precision: 10, scale: 2 }).notNull(),
  cuotasPactadas: integer('cuotas_pactadas').notNull(),
  saldoPendiente: numeric('saldo_pendiente', { precision: 10, scale: 2 }).notNull(),
  tipoArcoActual: text('tipo_arco_actual'),
  activo: boolean().notNull().default(true),
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
})

export const notasEvolucion = pgTable('notas_evolucion', {
  id: serial().primaryKey(),
  tratamientoId: integer('tratamiento_id')
    .notNull()
    .references(() => tratamientosOrtodoncia.id, { onDelete: 'cascade' }),
  nota: text().notNull(),
  arcoUsado: text('arco_usado'),
  montoPagado: numeric('monto_pagado', { precision: 10, scale: 2 }),
  creadoEn: timestamp('creado_en').defaultNow(),
})

export const pagos = pgTable('pagos', {
  id: serial().primaryKey(),
  pacienteId: integer('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  concepto: text().notNull(),
  monto: numeric({ precision: 10, scale: 2 }).notNull(),
  estado: text().notNull().default('pendiente'), // pendiente | pagado
  tipoProcedimiento: text('tipo_procedimiento'), // fijo_ortodoncia | procedimiento_variable
  fechaPago: date('fecha_pago'),
  creadoEn: timestamp('creado_en').defaultNow(),
})
