CREATE TABLE "citas" (
	"id" serial PRIMARY KEY,
	"paciente_id" integer NOT NULL,
	"fecha" date NOT NULL,
	"hora" text NOT NULL,
	"especialidad" text NOT NULL,
	"estado" text DEFAULT 'programada' NOT NULL,
	"notas" text,
	"creado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notas_evolucion" (
	"id" serial PRIMARY KEY,
	"tratamiento_id" integer NOT NULL,
	"nota" text NOT NULL,
	"arco_usado" text,
	"monto_pagado" numeric(10,2),
	"creado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pacientes" (
	"id" serial PRIMARY KEY,
	"nombre_completo" text NOT NULL,
	"dni" text NOT NULL UNIQUE,
	"celular" text,
	"correo" text,
	"direccion" text,
	"fecha_nacimiento" date,
	"antecedentes" text,
	"creado_en" timestamp DEFAULT now(),
	"actualizado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" serial PRIMARY KEY,
	"paciente_id" integer NOT NULL,
	"concepto" text NOT NULL,
	"monto" numeric(10,2) NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"tipo_procedimiento" text,
	"fecha_pago" date,
	"creado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sesiones" (
	"id" text PRIMARY KEY,
	"usuario_id" integer NOT NULL,
	"expira_en" timestamp NOT NULL,
	"creado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tratamientos_ortodoncia" (
	"id" serial PRIMARY KEY,
	"paciente_id" integer NOT NULL,
	"costo_total" numeric(10,2) NOT NULL,
	"cuotas_pactadas" integer NOT NULL,
	"saldo_pendiente" numeric(10,2) NOT NULL,
	"tipo_arco_actual" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp DEFAULT now(),
	"actualizado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY,
	"nombre" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"rol" text DEFAULT 'recepcionista' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_pacientes_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notas_evolucion" ADD CONSTRAINT "notas_evolucion_tratamiento_id_tratamientos_ortodoncia_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "tratamientos_ortodoncia"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_paciente_id_pacientes_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_usuarios_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id");--> statement-breakpoint
ALTER TABLE "tratamientos_ortodoncia" ADD CONSTRAINT "tratamientos_ortodoncia_paciente_id_pacientes_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE;