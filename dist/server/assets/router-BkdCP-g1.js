import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pgTable, timestamp, date, text, numeric, integer, serial, boolean } from "drizzle-orm/pg-core";
import { eq, desc, count, sum, or, like, and, gte, lte } from "drizzle-orm";
const Route$k = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clínica Dental Azula2" }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx("link", { rel: "icon", type: "image/png", href: "/favicon-source.png" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap",
          rel: "stylesheet"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$6 = () => import("./pacientes-B1b3JKTI.js");
const Route$j = createFileRoute("/pacientes")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./ortodoncia-B098JjOn.js");
const Route$i = createFileRoute("/ortodoncia")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./login-0FcdGNIS.js");
const Route$h = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./facturacion-C1PJGsG9.js");
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const Route$g = createFileRoute("/facturacion")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-DrSAEX8K.js");
const Route$f = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./agenda-C09zctlK.js");
const Route$e = createFileRoute("/agenda")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-BTU5dmpx.js");
const Route$d = createFileRoute("/")({
  loader: () => {
    throw redirect({
      to: "/dashboard"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const usuarios = pgTable("usuarios", {
  id: serial().primaryKey(),
  nombre: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  rol: text().notNull().default("recepcionista"),
  // administrador | odontologo | recepcionista
  activo: boolean().notNull().default(true),
  creadoEn: timestamp("creado_en").defaultNow()
});
const sesiones = pgTable("sesiones", {
  id: text().primaryKey(),
  usuarioId: integer("usuario_id").notNull().references(() => usuarios.id),
  expiraEn: timestamp("expira_en").notNull(),
  creadoEn: timestamp("creado_en").defaultNow()
});
const pacientes = pgTable("pacientes", {
  id: serial().primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  dni: text().notNull().unique(),
  celular: text(),
  correo: text(),
  direccion: text(),
  fechaNacimiento: date("fecha_nacimiento"),
  antecedentes: text(),
  creadoEn: timestamp("creado_en").defaultNow(),
  actualizadoEn: timestamp("actualizado_en").defaultNow()
});
const citas = pgTable("citas", {
  id: serial().primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  fecha: date().notNull(),
  hora: text().notNull(),
  especialidad: text().notNull(),
  // odontologia_general | ortodoncia | endodoncia
  estado: text().notNull().default("programada"),
  // programada | reprogramada | cancelada | completada
  notas: text(),
  creadoEn: timestamp("creado_en").defaultNow()
});
const tratamientosOrtodoncia = pgTable("tratamientos_ortodoncia", {
  id: serial().primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  costoTotal: numeric("costo_total", { precision: 10, scale: 2 }).notNull(),
  cuotasPactadas: integer("cuotas_pactadas").notNull(),
  saldoPendiente: numeric("saldo_pendiente", { precision: 10, scale: 2 }).notNull(),
  tipoArcoActual: text("tipo_arco_actual"),
  activo: boolean().notNull().default(true),
  creadoEn: timestamp("creado_en").defaultNow(),
  actualizadoEn: timestamp("actualizado_en").defaultNow()
});
const notasEvolucion = pgTable("notas_evolucion", {
  id: serial().primaryKey(),
  tratamientoId: integer("tratamiento_id").notNull().references(() => tratamientosOrtodoncia.id, { onDelete: "cascade" }),
  nota: text().notNull(),
  arcoUsado: text("arco_usado"),
  montoPagado: numeric("monto_pagado", { precision: 10, scale: 2 }),
  creadoEn: timestamp("creado_en").defaultNow()
});
const pagos = pgTable("pagos", {
  id: serial().primaryKey(),
  pacienteId: integer("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  concepto: text().notNull(),
  monto: numeric({ precision: 10, scale: 2 }).notNull(),
  estado: text().notNull().default("pendiente"),
  // pendiente | pagado
  tipoProcedimiento: text("tipo_procedimiento"),
  // fijo_ortodoncia | procedimiento_variable
  fechaPago: date("fecha_pago"),
  creadoEn: timestamp("creado_en").defaultNow()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  citas,
  notasEvolucion,
  pacientes,
  pagos,
  sesiones,
  tratamientosOrtodoncia,
  usuarios
}, Symbol.toStringTag, { value: "Module" }));
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "12345",
  database: "Azula2"
});
const db = drizzle({
  client: pool,
  schema
});
const Route$c = createFileRoute("/api/seed")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const demoPacientes = [
            { nombreCompleto: "Ana García Torres", dni: "45678901", celular: "987654321", correo: "ana@email.com", direccion: "Av. Larco 120, Miraflores", fechaNacimiento: "1992-03-15", antecedentes: "Alergia a la penicilina" },
            { nombreCompleto: "Carlos Mendoza Ríos", dni: "32145678", celular: "976543210", correo: "carlos@email.com", direccion: "Jr. Puno 456, Lima", fechaNacimiento: "1985-07-22", antecedentes: null },
            { nombreCompleto: "María Fernández López", dni: "56789012", celular: "965432109", correo: "maria@email.com", direccion: "Calle Los Olivos 89, San Isidro", fechaNacimiento: "1998-11-08", antecedentes: "Diabetes tipo 2" },
            { nombreCompleto: "Luis Herrera Villanueva", dni: "23456789", celular: "954321098", correo: null, direccion: "Av. Universitaria 567, Los Olivos", fechaNacimiento: "1978-05-30", antecedentes: null },
            { nombreCompleto: "Rosa Palomino Chávez", dni: "67890123", celular: "943210987", correo: "rosa@email.com", direccion: "Jr. Callao 234, Cercado de Lima", fechaNacimiento: "2001-09-14", antecedentes: null }
          ];
          const insertedPacientes = [];
          for (const p of demoPacientes) {
            const [row] = await db.insert(pacientes).values(p).onConflictDoNothing().returning();
            if (row) insertedPacientes.push(row);
          }
          if (insertedPacientes.length > 0) {
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
            const pid1 = insertedPacientes[0]?.id;
            const pid2 = insertedPacientes[1]?.id;
            const pid3 = insertedPacientes[2]?.id;
            if (pid1) {
              await db.insert(citas).values([
                { pacienteId: pid1, fecha: today, hora: "09:00", especialidad: "ortodoncia", estado: "programada" },
                { pacienteId: pid2 ?? pid1, fecha: today, hora: "10:30", especialidad: "odontologia_general", estado: "programada" },
                { pacienteId: pid3 ?? pid1, fecha: today, hora: "11:00", especialidad: "endodoncia", estado: "programada" },
                { pacienteId: pid1, fecha: tomorrow, hora: "09:30", especialidad: "ortodoncia", estado: "programada" }
              ]).onConflictDoNothing();
              await db.insert(pagos).values([
                { pacienteId: pid1, concepto: "Cuota Ortodoncia", monto: "250.00", tipoProcedimiento: "fijo_ortodoncia", estado: "pendiente" },
                { pacienteId: pid2 ?? pid1, concepto: "Limpieza Dental", monto: "80.00", tipoProcedimiento: "procedimiento_variable", estado: "pagado", fechaPago: today },
                { pacienteId: pid3 ?? pid1, concepto: "Consulta General", monto: "50.00", tipoProcedimiento: "procedimiento_variable", estado: "pendiente" }
              ]).onConflictDoNothing();
            }
          }
          return Response.json({ ok: true, message: "Datos de demostración cargados" });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error al cargar datos demo" }, { status: 500 });
        }
      }
    }
  }
});
const Route$b = createFileRoute("/api/pagos/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const tipo = url.searchParams.get("tipo");
          const rows = await db.select({
            id: pagos.id,
            concepto: pagos.concepto,
            monto: pagos.monto,
            estado: pagos.estado,
            tipoProcedimiento: pagos.tipoProcedimiento,
            fechaPago: pagos.fechaPago,
            creadoEn: pagos.creadoEn,
            pacienteId: pagos.pacienteId,
            pacienteNombre: pacientes.nombreCompleto
          }).from(pagos).innerJoin(pacientes, eq(pagos.pacienteId, pacientes.id)).orderBy(desc(pagos.creadoEn));
          if (tipo === "reporte") {
            const stats = await db.select({
              mes: pagos.fechaPago,
              total: sum(pagos.monto),
              conteo: count()
            }).from(pagos).where(eq(pagos.estado, "pagado")).groupBy(pagos.fechaPago).orderBy(pagos.fechaPago);
            const frecuentes = await db.select({
              concepto: pagos.concepto,
              conteo: count(),
              total: sum(pagos.monto)
            }).from(pagos).groupBy(pagos.concepto).orderBy(desc(count())).limit(10);
            return Response.json({ rows, stats, frecuentes });
          }
          return Response.json(rows);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { pacienteId, concepto, monto, tipoProcedimiento } = body;
          if (!pacienteId || !concepto || !monto) {
            return Response.json({ error: "Campos requeridos faltantes" }, { status: 400 });
          }
          const [row] = await db.insert(pagos).values({
            pacienteId: parseInt(pacienteId),
            concepto,
            monto: monto.toString(),
            tipoProcedimiento,
            estado: "pendiente"
          }).returning();
          return Response.json(row, { status: 201 });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$a = createFileRoute("/api/pacientes/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const q = url.searchParams.get("q") || "";
          let rows;
          if (q) {
            rows = await db.select().from(pacientes).where(
              or(
                like(pacientes.nombreCompleto, `%${q}%`),
                like(pacientes.dni, `%${q}%`)
              )
            ).orderBy(desc(pacientes.creadoEn));
          } else {
            rows = await db.select().from(pacientes).orderBy(desc(pacientes.creadoEn));
          }
          return Response.json(rows);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes } = body;
          if (!nombreCompleto || !dni) {
            return Response.json(
              { error: "Nombre y DNI son requeridos" },
              { status: 400 }
            );
          }
          const [row] = await db.insert(pacientes).values({ nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes }).returning();
          return Response.json(row, { status: 201 });
        } catch (err) {
          if (err.message?.includes("unique")) {
            return Response.json({ error: "El DNI ya está registrado" }, { status: 409 });
          }
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$9 = createFileRoute("/api/ortodoncia/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const rows = await db.select({
            id: tratamientosOrtodoncia.id,
            costoTotal: tratamientosOrtodoncia.costoTotal,
            cuotasPactadas: tratamientosOrtodoncia.cuotasPactadas,
            saldoPendiente: tratamientosOrtodoncia.saldoPendiente,
            tipoArcoActual: tratamientosOrtodoncia.tipoArcoActual,
            activo: tratamientosOrtodoncia.activo,
            creadoEn: tratamientosOrtodoncia.creadoEn,
            pacienteId: tratamientosOrtodoncia.pacienteId,
            pacienteNombre: pacientes.nombreCompleto,
            pacienteDni: pacientes.dni
          }).from(tratamientosOrtodoncia).innerJoin(pacientes, eq(tratamientosOrtodoncia.pacienteId, pacientes.id)).orderBy(desc(tratamientosOrtodoncia.creadoEn));
          return Response.json(rows);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { pacienteId, costoTotal, cuotasPactadas, tipoArcoActual } = body;
          if (!pacienteId || !costoTotal || !cuotasPactadas) {
            return Response.json({ error: "Campos requeridos faltantes" }, { status: 400 });
          }
          const [row] = await db.insert(tratamientosOrtodoncia).values({
            pacienteId: parseInt(pacienteId),
            costoTotal: costoTotal.toString(),
            cuotasPactadas: parseInt(cuotasPactadas),
            saldoPendiente: costoTotal.toString(),
            tipoArcoActual
          }).returning();
          return Response.json(row, { status: 201 });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$8 = createFileRoute("/api/citas/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const desde = url.searchParams.get("desde");
          const hasta = url.searchParams.get("hasta");
          let query = db.select({
            id: citas.id,
            fecha: citas.fecha,
            hora: citas.hora,
            especialidad: citas.especialidad,
            estado: citas.estado,
            notas: citas.notas,
            creadoEn: citas.creadoEn,
            pacienteId: citas.pacienteId,
            pacienteNombre: pacientes.nombreCompleto,
            pacienteCelular: pacientes.celular
          }).from(citas).innerJoin(pacientes, eq(citas.pacienteId, pacientes.id)).orderBy(citas.fecha, citas.hora);
          const rows = await query;
          return Response.json(rows);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { pacienteId, fecha, hora, especialidad, notas } = body;
          if (!pacienteId || !fecha || !hora || !especialidad) {
            return Response.json({ error: "Campos requeridos faltantes" }, { status: 400 });
          }
          const [row] = await db.insert(citas).values({ pacienteId: parseInt(pacienteId), fecha, hora, especialidad, notas, estado: "programada" }).returning();
          return Response.json(row, { status: 201 });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$7 = createFileRoute("/api/pagos/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json();
          const { estado, fechaPago } = body;
          const [row] = await db.update(pagos).set({
            estado,
            fechaPago: estado === "pagado" ? fechaPago || (/* @__PURE__ */ new Date()).toISOString().split("T")[0] : null
          }).where(eq(pagos.id, parseInt(params.id))).returning();
          return Response.json(row);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        await db.delete(pagos).where(eq(pagos.id, parseInt(params.id)));
        return new Response(null, { status: 204 });
      }
    }
  }
});
const Route$6 = createFileRoute("/api/pacientes/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [row] = await db.select().from(pacientes).where(eq(pacientes.id, parseInt(params.id)));
        if (!row) return Response.json({ error: "No encontrado" }, { status: 404 });
        return Response.json(row);
      },
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json();
          const { nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes } = body;
          const [row] = await db.update(pacientes).set({ nombreCompleto, dni, celular, correo, direccion, fechaNacimiento, antecedentes, actualizadoEn: /* @__PURE__ */ new Date() }).where(eq(pacientes.id, parseInt(params.id))).returning();
          if (!row) return Response.json({ error: "No encontrado" }, { status: 404 });
          return Response.json(row);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        try {
          await db.delete(pacientes).where(eq(pacientes.id, parseInt(params.id)));
          return new Response(null, { status: 204 });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$5 = createFileRoute("/api/ortodoncia/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const [trat] = await db.select().from(tratamientosOrtodoncia).where(eq(tratamientosOrtodoncia.id, parseInt(params.id)));
          if (!trat) return Response.json({ error: "No encontrado" }, { status: 404 });
          const notas = await db.select().from(notasEvolucion).where(eq(notasEvolucion.tratamientoId, parseInt(params.id))).orderBy(desc(notasEvolucion.creadoEn));
          return Response.json({ ...trat, notas });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json();
          const { tipoArcoActual, activo } = body;
          const [row] = await db.update(tratamientosOrtodoncia).set({ tipoArcoActual, activo, actualizadoEn: /* @__PURE__ */ new Date() }).where(eq(tratamientosOrtodoncia.id, parseInt(params.id))).returning();
          return Response.json(row);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      POST: async ({ request, params }) => {
        try {
          const body = await request.json();
          const { nota, arcoUsado, montoPagado } = body;
          if (!nota) return Response.json({ error: "Nota requerida" }, { status: 400 });
          const [notaRow] = await db.insert(notasEvolucion).values({
            tratamientoId: parseInt(params.id),
            nota,
            arcoUsado,
            montoPagado: montoPagado ? montoPagado.toString() : null
          }).returning();
          if (montoPagado && parseFloat(montoPagado) > 0) {
            const [trat] = await db.select().from(tratamientosOrtodoncia).where(eq(tratamientosOrtodoncia.id, parseInt(params.id)));
            if (trat) {
              const nuevoSaldo = Math.max(
                0,
                parseFloat(trat.saldoPendiente) - parseFloat(montoPagado)
              );
              await db.update(tratamientosOrtodoncia).set({ saldoPendiente: nuevoSaldo.toFixed(2), actualizadoEn: /* @__PURE__ */ new Date() }).where(eq(tratamientosOrtodoncia.id, parseInt(params.id)));
            }
          }
          return Response.json(notaRow, { status: 201 });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$4 = createFileRoute("/api/dashboard/stats")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          const startOfMonth = today.slice(0, 8) + "01";
          const endOfMonth = new Date(
            (/* @__PURE__ */ new Date()).getFullYear(),
            (/* @__PURE__ */ new Date()).getMonth() + 1,
            0
          ).toISOString().split("T")[0];
          const citasHoy = await db.select().from(citas).innerJoin(pacientes, eq(citas.pacienteId, pacientes.id)).where(and(eq(citas.fecha, today), eq(citas.estado, "programada")));
          const pagosPendientes = await db.select().from(pagos).innerJoin(pacientes, eq(pagos.pacienteId, pacientes.id)).where(
            and(
              eq(pagos.estado, "pendiente"),
              gte(pagos.creadoEn, new Date(startOfMonth)),
              lte(pagos.creadoEn, /* @__PURE__ */ new Date(endOfMonth + "T23:59:59"))
            )
          );
          const tratamientosActivos = await db.select({ count: count() }).from(tratamientosOrtodoncia).where(eq(tratamientosOrtodoncia.activo, true));
          const totalPendiente = pagosPendientes.reduce(
            (acc, p) => acc + parseFloat(p.pagos.monto),
            0
          );
          const totalCobrado = await db.select({ total: sum(pagos.monto) }).from(pagos).where(
            and(
              eq(pagos.estado, "pagado"),
              gte(pagos.creadoEn, new Date(startOfMonth)),
              lte(pagos.creadoEn, /* @__PURE__ */ new Date(endOfMonth + "T23:59:59"))
            )
          );
          return Response.json({
            citasHoy: citasHoy.map((r) => ({
              id: r.citas.id,
              hora: r.citas.hora,
              especialidad: r.citas.especialidad,
              estado: r.citas.estado,
              paciente: {
                id: r.pacientes.id,
                nombreCompleto: r.pacientes.nombreCompleto
              }
            })),
            pagosPendientesMes: pagosPendientes.map((r) => ({
              id: r.pagos.id,
              concepto: r.pagos.concepto,
              monto: r.pagos.monto,
              paciente: {
                id: r.pacientes.id,
                nombreCompleto: r.pacientes.nombreCompleto
              }
            })),
            totalPendienteMes: totalPendiente.toFixed(2),
            totalCobradoMes: parseFloat(totalCobrado[0]?.total ?? "0").toFixed(2),
            tratamientosActivos: tratamientosActivos[0]?.count ?? 0
          });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$3 = createFileRoute("/api/citas/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const body = await request.json();
          const { pacienteId, fecha, hora, especialidad, estado, notas } = body;
          const [row] = await db.update(citas).set({ pacienteId, fecha, hora, especialidad, estado, notas }).where(eq(citas.id, parseInt(params.id))).returning();
          return Response.json(row);
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        await db.delete(citas).where(eq(citas.id, parseInt(params.id)));
        return new Response(null, { status: 204 });
      }
    }
  }
});
const Route$2 = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const cookie = request.headers.get("cookie") || "";
          const match = cookie.match(/azula_session=([^;]+)/);
          if (!match) {
            return Response.json({ error: "No autenticado" }, { status: 401 });
          }
          const sessionId = match[1];
          const now = /* @__PURE__ */ new Date();
          const [session] = await db.select().from(sesiones).where(eq(sesiones.id, sessionId));
          if (!session || session.expiraEn < now) {
            return Response.json({ error: "Sesión expirada" }, { status: 401 });
          }
          const [user] = await db.select({
            id: usuarios.id,
            nombre: usuarios.nombre,
            email: usuarios.email,
            rol: usuarios.rol
          }).from(usuarios).where(eq(usuarios.id, session.usuarioId));
          if (!user) {
            return Response.json({ error: "Usuario no encontrado" }, { status: 401 });
          }
          return Response.json({ user });
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const Route$1 = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/azula_session=([^;]+)/);
        if (match) {
          await db.delete(sesiones).where(eq(sesiones.id, match[1]));
        }
        return Response.json(
          { ok: true },
          {
            headers: {
              "Set-Cookie": "azula_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
            }
          }
        );
      }
    }
  }
});
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "azuladent_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function generateSessionId() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const DEMO_USERS = [
  {
    email: "admin@azuladent.com",
    password: "admin123",
    nombre: "Dr. Carlos Azula",
    rol: "administrador"
  },
  {
    email: "dentista@azuladent.com",
    password: "dent123",
    nombre: "Dra. María López",
    rol: "odontologo"
  },
  {
    email: "recep@azuladent.com",
    password: "recep123",
    nombre: "Ana García",
    rol: "recepcionista"
  }
];
async function ensureDefaultUsers() {
  const count2 = await db.select().from(usuarios).limit(1);
  if (count2.length === 0) {
    for (const u of DEMO_USERS) {
      const hashed = await hashPassword(u.password);
      await db.insert(usuarios).values({
        nombre: u.nombre,
        email: u.email,
        password: hashed,
        rol: u.rol
      }).onConflictDoNothing();
    }
  }
}
const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await ensureDefaultUsers();
          const { email, password } = await request.json();
          if (!email || !password) {
            return Response.json(
              { error: "Email y contraseña requeridos" },
              { status: 400 }
            );
          }
          const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email.toLowerCase()));
          if (!user) {
            return Response.json(
              { error: "Credenciales inválidas" },
              { status: 401 }
            );
          }
          const hashed = await hashPassword(password);
          if (hashed !== user.password) {
            return Response.json(
              { error: "Credenciales inválidas" },
              { status: 401 }
            );
          }
          const sessionId = generateSessionId();
          const expiraEn = new Date(Date.now() + 8 * 60 * 60 * 1e3);
          await db.insert(sesiones).values({
            id: sessionId,
            usuarioId: user.id,
            expiraEn
          });
          return Response.json(
            {
              user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
              },
              sessionId
            },
            {
              headers: {
                "Set-Cookie": `azula_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`
              }
            }
          );
        } catch (err) {
          console.error(err);
          return Response.json({ error: "Error interno" }, { status: 500 });
        }
      }
    }
  }
});
const PacientesRoute = Route$j.update({
  id: "/pacientes",
  path: "/pacientes",
  getParentRoute: () => Route$k
});
const OrtodonciaRoute = Route$i.update({
  id: "/ortodoncia",
  path: "/ortodoncia",
  getParentRoute: () => Route$k
});
const LoginRoute = Route$h.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$k
});
const FacturacionRoute = Route$g.update({
  id: "/facturacion",
  path: "/facturacion",
  getParentRoute: () => Route$k
});
const DashboardRoute = Route$f.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$k
});
const AgendaRoute = Route$e.update({
  id: "/agenda",
  path: "/agenda",
  getParentRoute: () => Route$k
});
const IndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$k
});
const ApiSeedRoute = Route$c.update({
  id: "/api/seed",
  path: "/api/seed",
  getParentRoute: () => Route$k
});
const ApiPagosIndexRoute = Route$b.update({
  id: "/api/pagos/",
  path: "/api/pagos/",
  getParentRoute: () => Route$k
});
const ApiPacientesIndexRoute = Route$a.update({
  id: "/api/pacientes/",
  path: "/api/pacientes/",
  getParentRoute: () => Route$k
});
const ApiOrtodonciaIndexRoute = Route$9.update({
  id: "/api/ortodoncia/",
  path: "/api/ortodoncia/",
  getParentRoute: () => Route$k
});
const ApiCitasIndexRoute = Route$8.update({
  id: "/api/citas/",
  path: "/api/citas/",
  getParentRoute: () => Route$k
});
const ApiPagosIdRoute = Route$7.update({
  id: "/api/pagos/$id",
  path: "/api/pagos/$id",
  getParentRoute: () => Route$k
});
const ApiPacientesIdRoute = Route$6.update({
  id: "/api/pacientes/$id",
  path: "/api/pacientes/$id",
  getParentRoute: () => Route$k
});
const ApiOrtodonciaIdRoute = Route$5.update({
  id: "/api/ortodoncia/$id",
  path: "/api/ortodoncia/$id",
  getParentRoute: () => Route$k
});
const ApiDashboardStatsRoute = Route$4.update({
  id: "/api/dashboard/stats",
  path: "/api/dashboard/stats",
  getParentRoute: () => Route$k
});
const ApiCitasIdRoute = Route$3.update({
  id: "/api/citas/$id",
  path: "/api/citas/$id",
  getParentRoute: () => Route$k
});
const ApiAuthMeRoute = Route$2.update({
  id: "/api/auth/me",
  path: "/api/auth/me",
  getParentRoute: () => Route$k
});
const ApiAuthLogoutRoute = Route$1.update({
  id: "/api/auth/logout",
  path: "/api/auth/logout",
  getParentRoute: () => Route$k
});
const ApiAuthLoginRoute = Route.update({
  id: "/api/auth/login",
  path: "/api/auth/login",
  getParentRoute: () => Route$k
});
const rootRouteChildren = {
  IndexRoute,
  AgendaRoute,
  DashboardRoute,
  FacturacionRoute,
  LoginRoute,
  OrtodonciaRoute,
  PacientesRoute,
  ApiSeedRoute,
  ApiAuthLoginRoute,
  ApiAuthLogoutRoute,
  ApiAuthMeRoute,
  ApiCitasIdRoute,
  ApiDashboardStatsRoute,
  ApiOrtodonciaIdRoute,
  ApiPacientesIdRoute,
  ApiPagosIdRoute,
  ApiCitasIndexRoute,
  ApiOrtodonciaIndexRoute,
  ApiPacientesIndexRoute,
  ApiPagosIndexRoute
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
