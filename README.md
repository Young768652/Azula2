# 🦷 Azula Dent System - Sistema de Gestión Odontológica

Bienvenido al repositorio oficial de **"Azula Dent System"**, una solución tecnológica web de vanguardia diseñada específicamente para automatizar, centralizar y optimizar los flujos de trabajo clínicos y administrativos de la **Clínica Dental Azula2**. 

Este software representa la transición exitosa de un modelo operativo tradicional manual (basado en registros en papel, cuadernos de control y tarjetas físicas de cartón) hacia un entorno digital interactivo, seguro y escalable, alineado con las exigencias modernas de la gestión de salud dental.


## 🏛️ Información Institucional
* **Universidad:** Universidad Nacional Daniel Alcides Carrión (UNDAC)
* **Facultad:** Facultad de Ingeniería
* **Escuela:** Escuela de Formación Profesional de Ingeniería de Sistemas y Computación
* **Asignatura:** Ingeniería de Software II
* **Semestre Académico:** VII
* **Periodo:** 2026A
* **Docente:** Mg. VICENTE GUERRA, Nilton Luis
* **Ubicación:** Cerro de Pasco, Perú


## 👥 Equipo de Desarrollo (Roles Scrum)
* **Scrum Master:** VALLE ESPINOZA, Xiomara Isabel - Facilitar las ceremonias Scrum (Planning, Daily, Review, Retrospectiva) y remover impedimentos técnicos u organizacionales.
* **Product Owner:** SOLIS MONTES, Yuriana - Gestión y priorización del Product Backlog, definición de criterios de aceptación y validación del valor de negocio.
* **Arquitecta de Software:** CASTRO MARTÍNEZ, Jamela - Diseño de la arquitectura técnica general del sistema, definición del modelo de datos y estándares de escalabilidad.
* **DevOps / Backend:** CARLOS MENDOZA, Alessandra - Desarrollo de la lógica del servidor, API interna, gestión de infraestructura en la nube y pipelines de despliegue.
* **UX/UI / Frontend:** PALMA TOLENTINO, Anjali - Investigación de usabilidad, diseño de interfaces de alta fidelidad con tema oscuro e implementación responsiva del entorno cliente.


## 🛠️ Arquitectura y Stack Tecnológico
La aplicación se construyó utilizando un ecosistema moderno de desarrollo de software para garantizar un rendimiento óptimo en la nube:

* **Frontend & UI:** React 19, TypeScript, Tailwind CSS v4 (para el diseño interactivo en tema oscuro), Lucide React (iconografía) y Chart.js junto a react-chartjs-2 (para gráficos estadísticos).
* **Enrutamiento y SSR:** TanStack Start y TanStack Router (arquitectura basada en rutas con tipado seguro y optimización de carga).
* **Base de Datos y ORM:** Netlify Database (Postgres) administrado mediante Drizzle ORM para la persistencia, control de migraciones y consultas eficientes de datos relacionales.
* **Despliegue e Infraestructura:** Netlify (arquitectura serverless, compilación automatizada y hosting de alta disponibilidad).


## ⚙️ Módulos Funcionales Implementados (Product Backlog)
El sistema cubre la totalidad de los requerimientos funcionales de alta prioridad extraídos durante la etapa de análisis del negocio:

1. **Panel de Control (Dashboard):** Vista analítica gerencial que centraliza las métricas clave en tiempo real (Citas programadas para el día, conteo de mensualidades de ortodoncia y alertas visuales automáticas de saldos pendientes).
2. **Gestión de Pacientes (CRUD):** Registro digital de expedientes con validación de documentos y un buscador reactivo integrado que filtra por Nombre o DNI instantáneamente.
3. **Agenda y Citas Interactiva:** Calendario dinámico mensual para programar, reprogramar o cancelar turnos clínicos por especialidad, optimizando el tiempo del odontólogo y del recepcionista.
4. **Control de Ortodoncia Especializado:** Módulo crítico que reemplaza las tarjetas físicas de cartón de la clínica, permitiendo almacenar el histórico ilimitado de evoluciones clínicas, arcos utilizados y saldos dinámicos por cuotas mensuales.
5. **Facturación y Reportes:** Sistema de caja preparado para procesar abonos de mensualidades fijas y tratamientos variables, con balance automatizado de totales cobrados y exportación de reportes financieros.
6. **Seguridad y Control de Accesos:** Autenticación protegida con control de acceso basado en roles (RBAC) para resguardar la privacidad de las historias clínicas.


## 📦 Ejecución Local y Credenciales de Acceso

```bash

# 1. INSTRUCCIONES PARA EJECUCIÓN LOCAL

# Instalar todas las dependencias del proyecto
npm install
# Iniciar el servidor de desarrollo en modo local
npm run dev

# *Una vez iniciado, abrir en el navegador: http://localhost:3000 o http://localhost:8889


# 2. CREDENCIALES DE ACCESO (PARA DEMOSTRACIÓN)
# Administrador:
Correo: admin@azuladent.com  | Contraseña: admin123
# Odontólogo:
Correo: dentista@azuladent.com | Contraseña: dent123
# Recepcionista:
Correo: recep@azuladent.com    | Contraseña: recep123