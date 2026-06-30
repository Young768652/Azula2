import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { A as AuthProvider, u as useAuth } from "./CursorTrail-BXftWP5l.js";
import { A as AppLayout } from "./AppLayout-LVbzYOvy.js";
import { CalendarPlus, MessageCircle, ChevronLeft, ChevronRight, Calendar, Clock, Edit2, Trash2, X, AlertCircle, Save } from "lucide-react";
function AgendaGuard() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
  }, [user, loading]);
  if (loading) return /* @__PURE__ */ jsx("div", { style: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, children: /* @__PURE__ */ jsx("div", { style: {
    width: 36,
    height: 36,
    border: "3px solid var(--border)",
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  } }) });
  if (!user) return null;
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Agenda, {}) });
}
const ESPECIALIDADES = [{
  value: "odontologia_general",
  label: "Odontología General"
}, {
  value: "ortodoncia",
  label: "Ortodoncia"
}, {
  value: "endodoncia",
  label: "Endodoncia"
}];
const ESTADOS = [{
  value: "programada",
  label: "Programada"
}, {
  value: "reprogramada",
  label: "Reprogramada"
}, {
  value: "cancelada",
  label: "Cancelada"
}, {
  value: "completada",
  label: "Completada"
}];
const HORARIOS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function Agenda() {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(/* @__PURE__ */ new Date());
  const [selectedDay, setSelectedDay] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);
  const [editCita, setEditCita] = useState(null);
  const [form, setForm] = useState({
    pacienteId: "",
    fecha: "",
    hora: "",
    especialidad: "",
    estado: "programada",
    notas: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState(null);
  async function loadCitas() {
    setLoading(true);
    try {
      const [citasRes, pacRes] = await Promise.all([fetch("/api/citas/"), fetch("/api/pacientes/")]);
      if (citasRes.ok) setCitas(await citasRes.json());
      if (pacRes.ok) setPacientes(await pacRes.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadCitas();
  }, []);
  function openNew(fecha = "") {
    setEditCita(null);
    setForm({
      pacienteId: "",
      fecha,
      hora: "",
      especialidad: "",
      estado: "programada",
      notas: ""
    });
    setErrors({});
    setApiError("");
    setShowModal(true);
  }
  function openEdit(c) {
    setEditCita(c);
    setForm({
      pacienteId: String(c.pacienteId),
      fecha: c.fecha,
      hora: c.hora,
      especialidad: c.especialidad,
      estado: c.estado,
      notas: c.notas ?? ""
    });
    setErrors({});
    setApiError("");
    setShowModal(true);
  }
  function validate() {
    const e = {};
    if (!form.pacienteId) e.pacienteId = "Seleccione un paciente";
    if (!form.fecha) e.fecha = "La fecha es requerida";
    if (!form.hora) e.hora = "La hora es requerida";
    if (!form.especialidad) e.especialidad = "La especialidad es requerida";
    return e;
  }
  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      const url = editCita ? `/api/citas/${editCita.id}` : "/api/citas/";
      const method = editCita ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          notas: form.notas || null
        })
      });
      if (!res.ok) {
        const d = await res.json();
        setApiError(d.error || "Error al guardar");
        return;
      }
      setShowModal(false);
      loadCitas();
    } finally {
      setSubmitting(false);
    }
  }
  async function handleDelete(id) {
    await fetch(`/api/citas/${id}`, {
      method: "DELETE"
    });
    loadCitas();
  }
  function enviarRecordatorio(cita) {
    const espLabel = ESPECIALIDADES.find((e) => e.value === cita.especialidad)?.label ?? cita.especialidad;
    const fechaFormat = (/* @__PURE__ */ new Date(cita.fecha + "T00:00:00")).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const msg = `Hola ${cita.pacienteNombre}, le recordamos su cita en Clínica Dental Azula2 para el *${fechaFormat}* a las *${cita.hora}* - Especialidad: *${espLabel}*. Por favor confirme su asistencia. ¡Gracias!`;
    const phone = cita.pacienteCelular?.replace(/\D/g, "") ?? "";
    const url = phone ? `https://wa.me/51${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setWhatsappMsg(`Recordatorio enviado a ${cita.pacienteNombre}`);
    setTimeout(() => setWhatsappMsg(null), 3e3);
  }
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const citasByDay = {};
  citas.forEach((c) => {
    if (!citasByDay[c.fecha]) citasByDay[c.fecha] = [];
    citasByDay[c.fecha].push(c);
  });
  const citasDelDia = selectedDay ? (citasByDay[selectedDay] ?? []).filter((c) => !filterEstado || c.estado === filterEstado) : [];
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 12
    }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { style: {
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 4
        }, children: "Agenda Interactiva" }),
        /* @__PURE__ */ jsxs("p", { style: {
          fontSize: 14,
          color: "var(--text-muted)"
        }, children: [
          citas.length,
          " cita",
          citas.length !== 1 ? "s" : "",
          " en total"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn-primary", onClick: () => openNew(selectedDay ?? ""), children: [
        /* @__PURE__ */ jsx(CalendarPlus, { size: 16 }),
        "Nueva Cita"
      ] })
    ] }),
    whatsappMsg && /* @__PURE__ */ jsxs("div", { style: {
      background: "var(--accent-glow)",
      border: "1px solid rgba(26,75,140,0.3)",
      borderRadius: 8,
      padding: "10px 16px",
      marginBottom: 16,
      color: "var(--accent)",
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      gap: 8
    }, children: [
      /* @__PURE__ */ jsx(MessageCircle, { size: 14 }),
      " ",
      whatsappMsg
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
      gap: 20
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 20
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16
        }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setCurrentMonth(new Date(year, month - 1, 1)), style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            padding: 6
          }, children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxs("span", { style: {
            fontWeight: 700,
            color: "var(--text-primary)",
            fontSize: 15
          }, children: [
            MESES[month],
            " ",
            year
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setCurrentMonth(new Date(year, month + 1, 1)), style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            padding: 6
          }, children: /* @__PURE__ */ jsx(ChevronRight, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          marginBottom: 4
        }, children: DIAS_SEMANA.map((d) => /* @__PURE__ */ jsx("div", { style: {
          textAlign: "center",
          fontSize: 11,
          color: "var(--text-muted)",
          fontWeight: 600,
          padding: "4px 0"
        }, children: d }, d)) }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2
        }, children: [
          Array(firstDay).fill(null).map((_, i) => /* @__PURE__ */ jsx("div", {}, `e${i}`)),
          Array(daysInMonth).fill(null).map((_, i) => {
            const d = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const hasCitas = !!citasByDay[dateStr]?.length;
            const isSelected = selectedDay === dateStr;
            const isToday = dateStr === today;
            return /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedDay(dateStr), style: {
              width: "100%",
              aspectRatio: "1",
              borderRadius: 8,
              background: isSelected ? "var(--accent)" : isToday ? "rgba(26,75,140,0.08)" : "transparent",
              color: isSelected ? "var(--bg-primary)" : isToday ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: isSelected || isToday ? 700 : 400,
              position: "relative",
              transition: "all 0.15s",
              border: isSelected ? "none" : isToday ? "1px solid rgba(26,75,140,0.3)" : "1px solid transparent"
            }, children: [
              d,
              hasCitas && !isSelected && /* @__PURE__ */ jsx("span", { style: {
                position: "absolute",
                bottom: 3,
                left: "50%",
                transform: "translateX(-50%)",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: isToday ? "var(--accent)" : "var(--text-muted)"
              } })
            ] }, d);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 0,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontWeight: 700,
              color: "var(--text-primary)",
              fontSize: 15
            }, children: selectedDay ? (/* @__PURE__ */ new Date(selectedDay + "T00:00:00")).toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long"
            }) : "Seleccione un día" }),
            /* @__PURE__ */ jsxs("div", { style: {
              fontSize: 12,
              color: "var(--text-muted)"
            }, children: [
              citasByDay[selectedDay ?? ""]?.length ?? 0,
              " cita(s) agendada(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("select", { className: "input-field", value: filterEstado, onChange: (e) => setFilterEstado(e.target.value), style: {
            width: "auto",
            fontSize: 12,
            padding: "6px 10px"
          }, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
            ESTADOS.map((e) => /* @__PURE__ */ jsx("option", { value: e.value, children: e.label }, e.value))
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          maxHeight: 440,
          overflowY: "auto"
        }, children: !selectedDay ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(Calendar, { size: 36 }),
          /* @__PURE__ */ jsx("div", { children: "Seleccione un día para ver las citas" })
        ] }) : citasDelDia.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(Calendar, { size: 36 }),
          /* @__PURE__ */ jsxs("div", { children: [
            "No hay citas",
            filterEstado ? ` con estado "${ESTADOS.find((e) => e.value === filterEstado)?.label}"` : "",
            " para este día"
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "btn-primary btn-sm", style: {
            marginTop: 12
          }, onClick: () => openNew(selectedDay), children: [
            /* @__PURE__ */ jsx(CalendarPlus, { size: 14 }),
            " Agendar Cita"
          ] })
        ] }) : citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora)).map((cita) => /* @__PURE__ */ jsxs("div", { style: {
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)"
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: 10
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "initials-circle", children: cita.pacienteNombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: {
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontSize: 14
                }, children: cita.pacienteNombre }),
                /* @__PURE__ */ jsx("div", { style: {
                  fontSize: 12,
                  color: "var(--text-muted)"
                }, children: ESPECIALIDADES.find((e) => e.value === cita.especialidad)?.label ?? cita.especialidad })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--accent)",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0
            }, children: [
              /* @__PURE__ */ jsx(Clock, { size: 13 }),
              " ",
              cita.hora
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap"
          }, children: [
            /* @__PURE__ */ jsx("span", { className: `badge badge-${cita.estado}`, children: ESTADOS.find((e) => e.value === cita.estado)?.label ?? cita.estado }),
            cita.notas && /* @__PURE__ */ jsx("span", { style: {
              fontSize: 12,
              color: "var(--text-muted)"
            }, children: cita.notas })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            gap: 6,
            marginTop: 12,
            flexWrap: "wrap"
          }, children: [
            /* @__PURE__ */ jsxs("button", { className: "btn-whatsapp btn-sm", onClick: () => enviarRecordatorio(cita), children: [
              /* @__PURE__ */ jsx(MessageCircle, { size: 13 }),
              " Enviar Recordatorio"
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "btn-secondary btn-sm", onClick: () => openEdit(cita), children: [
              /* @__PURE__ */ jsx(Edit2, { size: 13 }),
              " Editar"
            ] }),
            /* @__PURE__ */ jsx("button", { className: "btn-danger btn-sm", onClick: () => handleDelete(cita.id), children: /* @__PURE__ */ jsx(Trash2, { size: 13 }) })
          ] })
        ] }, cita.id)) })
      ] })
    ] }),
    showModal && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: (e) => {
      if (e.target === e.currentTarget) setShowModal(false);
    }, children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: editCita ? "Editar Cita" : "Nueva Cita" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)"
        }, children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "modal-body", children: [
          apiError && /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#f87171",
            fontSize: 13
          }, children: [
            /* @__PURE__ */ jsx(AlertCircle, { size: 14 }),
            " ",
            apiError
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Paciente *" }),
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: form.pacienteId, onChange: (e) => setForm((f) => ({
                ...f,
                pacienteId: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar paciente..." }),
                pacientes.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.nombreCompleto }, p.id))
              ] }),
              errors.pacienteId && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.pacienteId })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Fecha *" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "date", value: form.fecha, onChange: (e) => setForm((f) => ({
                ...f,
                fecha: e.target.value
              })) }),
              errors.fecha && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.fecha })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Hora *" }),
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: form.hora, onChange: (e) => setForm((f) => ({
                ...f,
                hora: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar hora..." }),
                HORARIOS.map((h) => /* @__PURE__ */ jsx("option", { value: h, children: h }, h))
              ] }),
              errors.hora && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.hora })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Especialidad *" }),
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: form.especialidad, onChange: (e) => setForm((f) => ({
                ...f,
                especialidad: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar especialidad..." }),
                ESPECIALIDADES.map((e) => /* @__PURE__ */ jsx("option", { value: e.value, children: e.label }, e.value))
              ] }),
              errors.especialidad && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.especialidad })
            ] }),
            editCita && /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Estado" }),
              /* @__PURE__ */ jsx("select", { className: "input-field", value: form.estado, onChange: (e) => setForm((f) => ({
                ...f,
                estado: e.target.value
              })), children: ESTADOS.map((e) => /* @__PURE__ */ jsx("option", { value: e.value, children: e.label }, e.value)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Notas (opcional)" }),
              /* @__PURE__ */ jsx("textarea", { className: "input-field", value: form.notas, onChange: (e) => setForm((f) => ({
                ...f,
                notas: e.target.value
              })), placeholder: "Observaciones, preparación especial...", rows: 2, style: {
                resize: "vertical"
              } })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: () => setShowModal(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "btn-primary", disabled: submitting, children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            submitting ? "Guardando..." : editCita ? "Guardar Cambios" : "Agendar Cita"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(AgendaGuard, {}) });
export {
  SplitComponent as component
};
