import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { A as AuthProvider, u as useAuth } from "./CursorTrail-BXftWP5l.js";
import { A as AppLayout } from "./AppLayout-LVbzYOvy.js";
import { Plus, Braces, ChevronUp, ChevronDown, PlusCircle, Clock, X, AlertCircle, Save } from "lucide-react";
function OrtodonciaGuard() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
    if (!loading && user && !["administrador", "odontologo"].includes(user.rol)) navigate({
      to: "/dashboard"
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
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Ortodoncia, {}) });
}
const EMPTY_TRAT_FORM = {
  pacienteId: "",
  costoTotal: "",
  cuotasPactadas: "",
  tipoArcoActual: ""
};
const EMPTY_NOTA_FORM = {
  nota: "",
  arcoUsado: "",
  montoPagado: ""
};
function Ortodoncia() {
  const [tratamientos, setTratamientos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrat, setShowNewTrat] = useState(false);
  const [tratForm, setTratForm] = useState({
    ...EMPTY_TRAT_FORM
  });
  const [tratErrors, setTratErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [notaForm, setNotaForm] = useState({
    ...EMPTY_NOTA_FORM
  });
  const [addingNota, setAddingNota] = useState(false);
  const [filterActivo, setFilterActivo] = useState("activo");
  async function loadData() {
    setLoading(true);
    try {
      const [tratRes, pacRes] = await Promise.all([fetch("/api/ortodoncia/"), fetch("/api/pacientes/")]);
      if (tratRes.ok) setTratamientos(await tratRes.json());
      if (pacRes.ok) setPacientes(await pacRes.json());
    } finally {
      setLoading(false);
    }
  }
  async function loadDetalle(id) {
    setLoadingDetalle(true);
    try {
      const res = await fetch(`/api/ortodoncia/${id}`);
      if (res.ok) setDetalle(await res.json());
    } finally {
      setLoadingDetalle(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);
  function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetalle(null);
    } else {
      setExpandedId(id);
      setNotaForm({
        ...EMPTY_NOTA_FORM
      });
      loadDetalle(id);
    }
  }
  function validateTrat() {
    const e = {};
    if (!tratForm.pacienteId) e.pacienteId = "Seleccione un paciente";
    if (!tratForm.costoTotal || isNaN(Number(tratForm.costoTotal)) || Number(tratForm.costoTotal) <= 0) e.costoTotal = "Ingrese un costo válido";
    if (!tratForm.cuotasPactadas || isNaN(Number(tratForm.cuotasPactadas)) || Number(tratForm.cuotasPactadas) <= 0) e.cuotasPactadas = "Ingrese las cuotas";
    return e;
  }
  async function handleNewTrat(e) {
    e.preventDefault();
    const errs = validateTrat();
    if (Object.keys(errs).length > 0) {
      setTratErrors(errs);
      return;
    }
    setTratErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/ortodoncia/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...tratForm,
          costoTotal: Number(tratForm.costoTotal),
          cuotasPactadas: Number(tratForm.cuotasPactadas)
        })
      });
      if (!res.ok) {
        const d = await res.json();
        setApiError(d.error || "Error al guardar");
        return;
      }
      setShowNewTrat(false);
      setTratForm({
        ...EMPTY_TRAT_FORM
      });
      loadData();
    } finally {
      setSubmitting(false);
    }
  }
  async function handleAddNota(tratId) {
    if (!notaForm.nota.trim()) return;
    setAddingNota(true);
    try {
      await fetch(`/api/ortodoncia/${tratId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nota: notaForm.nota,
          arcoUsado: notaForm.arcoUsado || null,
          montoPagado: notaForm.montoPagado ? Number(notaForm.montoPagado) : null
        })
      });
      setNotaForm({
        ...EMPTY_NOTA_FORM
      });
      await loadDetalle(tratId);
      loadData();
    } finally {
      setAddingNota(false);
    }
  }
  const filtered = tratamientos.filter((t) => {
    if (filterActivo === "activo") return t.activo;
    if (filterActivo === "finalizado") return !t.activo;
    return true;
  });
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
        }, children: "Control de Ortodoncia" }),
        /* @__PURE__ */ jsx("p", { style: {
          fontSize: 14,
          color: "var(--text-muted)"
        }, children: "Gestión de tratamientos y seguimiento evolutivo" })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn-primary", onClick: () => {
        setShowNewTrat(true);
        setTratErrors({});
        setApiError("");
      }, children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        "Nuevo Tratamiento"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      gap: 8,
      marginBottom: 20
    }, children: [{
      key: "activo",
      label: "Activos"
    }, {
      key: "finalizado",
      label: "Finalizados"
    }, {
      key: "todos",
      label: "Todos"
    }].map((tab) => /* @__PURE__ */ jsx("button", { className: `tab-btn${filterActivo === tab.key ? " active" : ""}`, onClick: () => setFilterActivo(tab.key), children: tab.label }, tab.key)) }),
    loading ? /* @__PURE__ */ jsxs("div", { style: {
      textAlign: "center",
      padding: 48,
      color: "var(--text-muted)"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        width: 28,
        height: 28,
        border: "2px solid var(--border)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 12px"
      } }),
      "Cargando tratamientos..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx(Braces, { size: 44 }),
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 15,
        fontWeight: 600
      }, children: [
        "Sin tratamientos ",
        filterActivo !== "todos" ? filterActivo + "s" : ""
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 13
      }, children: "Registre el primer tratamiento de ortodoncia" })
    ] }) }) : /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }, children: filtered.map((trat) => {
      const pagado = parseFloat(trat.costoTotal) - parseFloat(trat.saldoPendiente);
      const pct = parseFloat(trat.costoTotal) > 0 ? Math.round(pagado / parseFloat(trat.costoTotal) * 100) : 0;
      const isExpanded = expandedId === trat.id;
      return /* @__PURE__ */ jsxs("div", { className: "card", style: {
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "18px 20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: 16
        }, onClick: () => toggleExpand(trat.id), children: [
          /* @__PURE__ */ jsx("div", { className: "initials-circle", style: {
            marginTop: 2
          }, children: trat.pacienteNombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { style: {
            flex: 1,
            minWidth: 0
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
              flexWrap: "wrap"
            }, children: [
              /* @__PURE__ */ jsx("span", { style: {
                fontWeight: 700,
                color: "var(--text-primary)",
                fontSize: 15
              }, children: trat.pacienteNombre }),
              /* @__PURE__ */ jsxs("span", { style: {
                fontSize: 12,
                color: "var(--text-muted)"
              }, children: [
                "DNI: ",
                trat.pacienteDni
              ] }),
              /* @__PURE__ */ jsx("span", { className: `badge ${trat.activo ? "badge-completada" : "badge-cancelada"}`, style: {
                fontSize: 11
              }, children: trat.activo ? "Activo" : "Finalizado" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "8px 20px",
              marginBottom: 12
            }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: {
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2
                }, children: "Costo Total" }),
                /* @__PURE__ */ jsxs("div", { style: {
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: 15
                }, children: [
                  "S/ ",
                  parseFloat(trat.costoTotal).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: {
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2
                }, children: "Cuotas Pactadas" }),
                /* @__PURE__ */ jsx("div", { style: {
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: 15
                }, children: trat.cuotasPactadas })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: {
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2
                }, children: "Saldo Pendiente" }),
                /* @__PURE__ */ jsxs("div", { style: {
                  fontWeight: 700,
                  color: parseFloat(trat.saldoPendiente) > 0 ? "#f59e0b" : "#1A4B8C",
                  fontSize: 15
                }, children: [
                  "S/ ",
                  parseFloat(trat.saldoPendiente).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: {
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 2
                }, children: "Arco Actual" }),
                /* @__PURE__ */ jsx("div", { style: {
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontSize: 15
                }, children: trat.tipoArcoActual || "—" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4
              }, children: [
                /* @__PURE__ */ jsx("span", { style: {
                  fontSize: 12,
                  color: "var(--text-muted)"
                }, children: "Progreso de pago" }),
                /* @__PURE__ */ jsxs("span", { style: {
                  fontSize: 12,
                  fontWeight: 600,
                  color: pct >= 100 ? "#1A4B8C" : "var(--text-secondary)"
                }, children: [
                  pct,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsx("div", { className: "progress-fill", style: {
                width: `${pct}%`
              } }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: {
            color: "var(--text-muted)",
            flexShrink: 0
          }, children: isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { size: 18 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 18 }) })
        ] }),
        isExpanded && /* @__PURE__ */ jsxs("div", { style: {
          borderTop: "1px solid var(--border)",
          padding: "20px"
        }, children: [
          /* @__PURE__ */ jsx("h3", { style: {
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16
          }, children: "Notas de Evolución" }),
          /* @__PURE__ */ jsxs("div", { className: "card", style: {
            padding: 16,
            marginBottom: 16,
            background: "var(--bg-secondary)"
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12
            }, children: [
              /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
                gridColumn: "1 / -1",
                marginBottom: 0
              }, children: [
                /* @__PURE__ */ jsx("label", { children: "Nueva Nota de Evolución" }),
                /* @__PURE__ */ jsx("textarea", { className: "input-field", value: notaForm.nota, onChange: (e) => setNotaForm((f) => ({
                  ...f,
                  nota: e.target.value
                })), placeholder: "Descripción de la sesión, estado del tratamiento...", rows: 2, style: {
                  resize: "vertical"
                } })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
                marginBottom: 0
              }, children: [
                /* @__PURE__ */ jsx("label", { children: "Tipo de Arco Usado" }),
                /* @__PURE__ */ jsx("input", { className: "input-field", value: notaForm.arcoUsado, onChange: (e) => setNotaForm((f) => ({
                  ...f,
                  arcoUsado: e.target.value
                })), placeholder: "Ej: Arco 7B, NiTi 0.14" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
                marginBottom: 0
              }, children: [
                /* @__PURE__ */ jsx("label", { children: "Monto Pagado en esta Sesión (S/)" }),
                /* @__PURE__ */ jsx("input", { className: "input-field", type: "number", min: "0", step: "0.01", value: notaForm.montoPagado, onChange: (e) => setNotaForm((f) => ({
                  ...f,
                  montoPagado: e.target.value
                })), placeholder: "0.00" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "btn-primary btn-sm", onClick: () => handleAddNota(trat.id), disabled: addingNota || !notaForm.nota.trim(), children: [
              /* @__PURE__ */ jsx(PlusCircle, { size: 14 }),
              addingNota ? "Guardando..." : "Agregar Nota"
            ] })
          ] }),
          loadingDetalle ? /* @__PURE__ */ jsx("div", { style: {
            textAlign: "center",
            padding: 24,
            color: "var(--text-muted)"
          }, children: /* @__PURE__ */ jsx("div", { style: {
            width: 20,
            height: 20,
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto"
          } }) }) : !detalle?.notas?.length ? /* @__PURE__ */ jsx("div", { style: {
            textAlign: "center",
            padding: "20px",
            color: "var(--text-muted)",
            fontSize: 14
          }, children: "Sin notas de evolución registradas" }) : /* @__PURE__ */ jsx("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: 10
          }, children: detalle.notas.map((nota, idx) => /* @__PURE__ */ jsxs("div", { style: {
            padding: "14px 16px",
            background: "var(--bg-secondary)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            position: "relative"
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 6
            }, children: [
              /* @__PURE__ */ jsxs("span", { style: {
                fontSize: 12,
                color: "var(--text-muted)"
              }, children: [
                /* @__PURE__ */ jsx(Clock, { size: 11, style: {
                  display: "inline",
                  marginRight: 4
                } }),
                new Date(nota.creadoEn).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                }),
                " · ",
                new Date(nota.creadoEn).toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              ] }),
              /* @__PURE__ */ jsxs("span", { style: {
                fontSize: 11,
                color: "var(--text-muted)"
              }, children: [
                "Sesión #",
                detalle.notas.length - idx
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { style: {
              fontSize: 14,
              color: "var(--text-primary)",
              marginBottom: nota.arcoUsado || nota.montoPagado ? 10 : 0,
              lineHeight: 1.6
            }, children: nota.nota }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              gap: 16
            }, children: [
              nota.arcoUsado && /* @__PURE__ */ jsxs("div", { style: {
                fontSize: 12
              }, children: [
                /* @__PURE__ */ jsx("span", { style: {
                  color: "var(--text-muted)"
                }, children: "Arco: " }),
                /* @__PURE__ */ jsx("span", { style: {
                  color: "var(--accent)",
                  fontWeight: 600
                }, children: nota.arcoUsado })
              ] }),
              nota.montoPagado && parseFloat(nota.montoPagado) > 0 && /* @__PURE__ */ jsxs("div", { style: {
                fontSize: 12
              }, children: [
                /* @__PURE__ */ jsx("span", { style: {
                  color: "var(--text-muted)"
                }, children: "Pago: " }),
                /* @__PURE__ */ jsxs("span", { style: {
                  color: "#1A4B8C",
                  fontWeight: 600
                }, children: [
                  "S/ ",
                  parseFloat(nota.montoPagado).toFixed(2)
                ] })
              ] })
            ] })
          ] }, nota.id)) })
        ] })
      ] }, trat.id);
    }) }),
    showNewTrat && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: (e) => {
      if (e.target === e.currentTarget) setShowNewTrat(false);
    }, children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: "Nuevo Tratamiento de Ortodoncia" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowNewTrat(false), style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)"
        }, children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleNewTrat, children: [
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
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: tratForm.pacienteId, onChange: (e) => setTratForm((f) => ({
                ...f,
                pacienteId: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar paciente..." }),
                pacientes.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.nombreCompleto }, p.id))
              ] }),
              tratErrors.pacienteId && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: tratErrors.pacienteId })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Costo Total del Tratamiento (S/) *" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "number", min: "0", step: "0.01", value: tratForm.costoTotal, onChange: (e) => setTratForm((f) => ({
                ...f,
                costoTotal: e.target.value
              })), placeholder: "0.00" }),
              tratErrors.costoTotal && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: tratErrors.costoTotal })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Cuotas Pactadas *" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "number", min: "1", value: tratForm.cuotasPactadas, onChange: (e) => setTratForm((f) => ({
                ...f,
                cuotasPactadas: e.target.value
              })), placeholder: "12" }),
              tratErrors.cuotasPactadas && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: tratErrors.cuotasPactadas })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Tipo de Arco Inicial" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", value: tratForm.tipoArcoActual, onChange: (e) => setTratForm((f) => ({
                ...f,
                tipoArcoActual: e.target.value
              })), placeholder: "Ej: Arco 7B, NiTi 0.14..." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: () => setShowNewTrat(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "btn-primary", disabled: submitting, children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            submitting ? "Guardando..." : "Registrar Tratamiento"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(OrtodonciaGuard, {}) });
export {
  SplitComponent as component
};
