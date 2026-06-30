import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { A as AuthProvider, u as useAuth } from "./CursorTrail-BXftWP5l.js";
import { A as AppLayout } from "./AppLayout-LVbzYOvy.js";
import { Plus, DollarSign, CheckCircle2, TrendingUp, Receipt, BarChart2, Printer, X, AlertCircle, Save } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
function FacturacionGuard() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
    if (!loading && user && user.rol !== "administrador") navigate({
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
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Facturacion, {}) });
}
const PROCEDIMIENTOS = ["Consulta General", "Limpieza Dental", "Extracción Simple", "Extracción Molar", "Radiografía", "Endodoncia", "Blanqueamiento", "Resina Dental", "Cuota Ortodoncia", "Bracket Instalación", "Control de Ortodoncia", "Otro"];
const EMPTY_FORM = {
  pacienteId: "",
  concepto: "",
  monto: "",
  tipoProcedimiento: ""
};
const MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function Facturacion() {
  const [tab, setTab] = useState("pagos");
  const [pagos, setPagos] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    ...EMPTY_FORM
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [printPago, setPrintPago] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);
  const {
    user
  } = useAuth();
  async function loadData() {
    setLoading(true);
    try {
      const [pagosRes, reporteRes, pacRes] = await Promise.all([fetch("/api/pagos/"), fetch("/api/pagos/?tipo=reporte"), fetch("/api/pacientes/")]);
      if (pagosRes.ok) setPagos(await pagosRes.json());
      if (reporteRes.ok) setReporte(await reporteRes.json());
      if (pacRes.ok) setPacientes(await pacRes.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);
  function validate() {
    const e = {};
    if (!form.pacienteId) e.pacienteId = "Seleccione un paciente";
    if (!form.concepto.trim()) e.concepto = "El concepto es requerido";
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) e.monto = "Ingrese un monto válido";
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
      const res = await fetch("/api/pagos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          monto: Number(form.monto)
        })
      });
      if (!res.ok) {
        const d = await res.json();
        setApiError(d.error || "Error al guardar");
        return;
      }
      setShowModal(false);
      setForm({
        ...EMPTY_FORM
      });
      loadData();
    } finally {
      setSubmitting(false);
    }
  }
  async function marcarPagado(pagoId) {
    setMarkingPaid(pagoId);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: "pagado"
      })
    });
    setMarkingPaid(null);
    loadData();
  }
  const totalPendiente = pagos.filter((p) => p.estado === "pendiente").reduce((acc, p) => acc + parseFloat(p.monto), 0);
  const totalCobrado = pagos.filter((p) => p.estado === "pagado").reduce((acc, p) => acc + parseFloat(p.monto), 0);
  const monthlyData = (() => {
    const byMonth = {};
    pagos.filter((p) => p.estado === "pagado" && p.fechaPago).forEach((p) => {
      const m = p.fechaPago.slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + parseFloat(p.monto);
    });
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    return {
      labels: sorted.map(([k]) => {
        const [y, m] = k.split("-");
        return `${MESES_ES[parseInt(m) - 1]} ${y.slice(2)}`;
      }),
      datasets: [{
        label: "Ingresos (S/)",
        data: sorted.map(([, v]) => v),
        backgroundColor: "rgba(26,75,140,0.7)",
        borderRadius: 6,
        borderColor: "rgba(26,75,140,0.9)",
        borderWidth: 1
      }]
    };
  })();
  const frecuentesData = reporte?.frecuentes?.slice(0, 5);
  const donutData = frecuentesData ? {
    labels: frecuentesData.map((f) => f.concepto),
    datasets: [{
      data: frecuentesData.map((f) => f.conteo),
      backgroundColor: ["rgba(26,75,140,0.8)", "rgba(59,130,246,0.8)", "rgba(245,158,11,0.8)", "rgba(26,75,140,0.8)", "rgba(139,92,246,0.8)"],
      borderWidth: 0
    }]
  } : null;
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` S/ ${Number(ctx.raw).toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#7a9bbf"
        },
        grid: {
          color: "rgba(255,255,255,0.04)"
        }
      },
      y: {
        ticks: {
          color: "#7a9bbf"
        },
        grid: {
          color: "rgba(255,255,255,0.04)"
        }
      }
    }
  };
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
        }, children: "Facturación y Reportes" }),
        /* @__PURE__ */ jsx("p", { style: {
          fontSize: 14,
          color: "var(--text-muted)"
        }, children: "Control de pagos, comprobantes e informes" })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn-primary", onClick: () => {
        setShowModal(true);
        setErrors({});
        setApiError("");
      }, children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        "Registrar Pago"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 16,
      marginBottom: 24
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: "18px 20px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f59e0b"
          }, children: /* @__PURE__ */ jsx(DollarSign, { size: 17 }) }),
          /* @__PURE__ */ jsx("span", { style: {
            fontSize: 13,
            color: "var(--text-muted)"
          }, children: "Total Pendiente" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 22,
          fontWeight: 700,
          color: "#f59e0b"
        }, children: [
          "S/ ",
          totalPendiente.toLocaleString("es-PE", {
            minimumFractionDigits: 2
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 4
        }, children: [
          pagos.filter((p) => p.estado === "pendiente").length,
          " cobro(s) pendiente(s)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: "18px 20px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "rgba(26,75,140,0.12)",
            border: "1px solid rgba(26,75,140,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1A4B8C"
          }, children: /* @__PURE__ */ jsx(CheckCircle2, { size: 17 }) }),
          /* @__PURE__ */ jsx("span", { style: {
            fontSize: 13,
            color: "var(--text-muted)"
          }, children: "Total Cobrado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 22,
          fontWeight: 700,
          color: "#1A4B8C"
        }, children: [
          "S/ ",
          totalCobrado.toLocaleString("es-PE", {
            minimumFractionDigits: 2
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 4
        }, children: [
          pagos.filter((p) => p.estado === "pagado").length,
          " pago(s) completado(s)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: "18px 20px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "rgba(26,75,140,0.12)",
            border: "1px solid rgba(26,75,140,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)"
          }, children: /* @__PURE__ */ jsx(TrendingUp, { size: 17 }) }),
          /* @__PURE__ */ jsx("span", { style: {
            fontSize: 13,
            color: "var(--text-muted)"
          }, children: "Total Facturado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: [
          "S/ ",
          (totalPendiente + totalCobrado).toLocaleString("es-PE", {
            minimumFractionDigits: 2
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 4
        }, children: [
          pagos.length,
          " registro(s) total"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 8,
      marginBottom: 20
    }, children: [
      /* @__PURE__ */ jsxs("button", { className: `tab-btn${tab === "pagos" ? " active" : ""}`, onClick: () => setTab("pagos"), children: [
        /* @__PURE__ */ jsx(Receipt, { size: 14, style: {
          display: "inline",
          marginRight: 6
        } }),
        "Registro de Pagos"
      ] }),
      /* @__PURE__ */ jsxs("button", { className: `tab-btn${tab === "reportes" ? " active" : ""}`, onClick: () => setTab("reportes"), children: [
        /* @__PURE__ */ jsx(BarChart2, { size: 14, style: {
          display: "inline",
          marginRight: 6
        } }),
        "Reportes"
      ] })
    ] }),
    tab === "pagos" && /* @__PURE__ */ jsx("div", { className: "card", style: {
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsx("div", { className: "table-container", children: loading ? /* @__PURE__ */ jsx("div", { style: {
      padding: 48,
      textAlign: "center",
      color: "var(--text-muted)"
    }, children: /* @__PURE__ */ jsx("div", { style: {
      width: 24,
      height: 24,
      border: "2px solid var(--border)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      margin: "0 auto"
    } }) }) : pagos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx(Receipt, { size: 44 }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 15,
        fontWeight: 600
      }, children: "Sin registros de pago" })
    ] }) : /* @__PURE__ */ jsxs("table", { children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Paciente" }),
        /* @__PURE__ */ jsx("th", { children: "Concepto" }),
        /* @__PURE__ */ jsx("th", { children: "Monto" }),
        /* @__PURE__ */ jsx("th", { children: "Estado" }),
        /* @__PURE__ */ jsx("th", { children: "Fecha" }),
        /* @__PURE__ */ jsx("th", { children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: pagos.map((pago) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { style: {
          fontWeight: 600,
          color: "var(--text-primary)"
        }, children: pago.pacienteNombre }),
        /* @__PURE__ */ jsx("td", { children: pago.concepto }),
        /* @__PURE__ */ jsxs("td", { style: {
          fontWeight: 700,
          color: pago.estado === "pagado" ? "#1A4B8C" : "#f59e0b"
        }, children: [
          "S/ ",
          parseFloat(pago.monto).toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `badge badge-${pago.estado}`, children: pago.estado === "pagado" ? "Pagado" : "Pendiente" }) }),
        /* @__PURE__ */ jsx("td", { style: {
          fontSize: 13
        }, children: pago.fechaPago ? (/* @__PURE__ */ new Date(pago.fechaPago + "T00:00:00")).toLocaleDateString("es-PE") : new Date(pago.creadoEn).toLocaleDateString("es-PE") }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          gap: 6,
          flexWrap: "wrap"
        }, children: [
          pago.estado === "pendiente" && /* @__PURE__ */ jsxs("button", { className: "btn-success btn-sm", onClick: () => marcarPagado(pago.id), disabled: markingPaid === pago.id, children: [
            /* @__PURE__ */ jsx(CheckCircle2, { size: 13 }),
            markingPaid === pago.id ? "..." : "Cobrar"
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "btn-secondary btn-sm", onClick: () => setPrintPago(pago), children: [
            /* @__PURE__ */ jsx(Printer, { size: 13 }),
            " Comprobante"
          ] })
        ] }) })
      ] }, pago.id)) })
    ] }) }) }),
    tab === "reportes" && /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
      gap: 20
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 20
      }, children: [
        /* @__PURE__ */ jsx("h3", { style: {
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 16
        }, children: "Ingresos Mensuales (últimos 6 meses)" }),
        monthlyData.labels.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(BarChart2, { size: 36 }),
          /* @__PURE__ */ jsx("div", { children: "Sin datos de ingresos aún" })
        ] }) : /* @__PURE__ */ jsx(Bar, { data: monthlyData, options: chartOptions })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 20
      }, children: [
        /* @__PURE__ */ jsx("h3", { style: {
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 16
        }, children: "Tratamientos Más Frecuentes" }),
        donutData && frecuentesData && frecuentesData.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { style: {
            maxWidth: 220,
            margin: "0 auto 16px"
          }, children: /* @__PURE__ */ jsx(Doughnut, { data: donutData, options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            }
          } }) }),
          /* @__PURE__ */ jsx("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: 8
          }, children: frecuentesData.map((f, i) => /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: 8
            }, children: [
              /* @__PURE__ */ jsx("div", { style: {
                width: 10,
                height: 10,
                borderRadius: 2,
                background: donutData.datasets[0].backgroundColor[i],
                flexShrink: 0
              } }),
              /* @__PURE__ */ jsx("span", { style: {
                fontSize: 13,
                color: "var(--text-secondary)"
              }, children: f.concepto })
            ] }),
            /* @__PURE__ */ jsxs("span", { style: {
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)"
            }, children: [
              f.conteo,
              "x"
            ] })
          ] }, f.concepto)) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(BarChart2, { size: 36 }),
          /* @__PURE__ */ jsx("div", { children: "Sin datos suficientes" })
        ] })
      ] }),
      reporte?.frecuentes && reporte.frecuentes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 0,
        overflow: "hidden",
        gridColumn: "1 / -1"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)"
        }, children: /* @__PURE__ */ jsx("h3", { style: {
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: "Resumen por Procedimiento" }) }),
        /* @__PURE__ */ jsx("div", { className: "table-container", children: /* @__PURE__ */ jsxs("table", { children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Procedimiento" }),
            /* @__PURE__ */ jsx("th", { children: "Cantidad" }),
            /* @__PURE__ */ jsx("th", { children: "Total Generado" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: reporte.frecuentes.map((f) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { style: {
              fontWeight: 600,
              color: "var(--text-primary)"
            }, children: f.concepto }),
            /* @__PURE__ */ jsx("td", { children: f.conteo }),
            /* @__PURE__ */ jsxs("td", { style: {
              fontWeight: 700,
              color: "#1A4B8C"
            }, children: [
              "S/ ",
              parseFloat(f.total || "0").toFixed(2)
            ] })
          ] }, f.concepto)) })
        ] }) })
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
        }, children: "Registrar Pago" }),
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
              /* @__PURE__ */ jsx("label", { children: "Concepto / Procedimiento *" }),
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: form.concepto, onChange: (e) => setForm((f) => ({
                ...f,
                concepto: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar..." }),
                PROCEDIMIENTOS.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p))
              ] }),
              errors.concepto && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.concepto })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Monto (S/) *" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "number", min: "0", step: "0.01", value: form.monto, onChange: (e) => setForm((f) => ({
                ...f,
                monto: e.target.value
              })), placeholder: "0.00" }),
              errors.monto && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.monto })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Tipo de Procedimiento" }),
              /* @__PURE__ */ jsxs("select", { className: "input-field", value: form.tipoProcedimiento, onChange: (e) => setForm((f) => ({
                ...f,
                tipoProcedimiento: e.target.value
              })), children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar tipo..." }),
                /* @__PURE__ */ jsx("option", { value: "fijo_ortodoncia", children: "Cuota Fija - Ortodoncia" }),
                /* @__PURE__ */ jsx("option", { value: "procedimiento_variable", children: "Procedimiento Variable" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: () => setShowModal(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "btn-primary", disabled: submitting, children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            submitting ? "Guardando..." : "Registrar Pago"
          ] })
        ] })
      ] })
    ] }) }),
    printPago && /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", style: {
      maxWidth: 480
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: "Comprobante de Pago" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setPrintPago(null), style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)"
        }, children: /* @__PURE__ */ jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "modal-body", children: /* @__PURE__ */ jsxs("div", { id: "receipt", style: {
        background: "var(--bg-secondary)",
        borderRadius: 12,
        padding: 24,
        border: "1px solid var(--border)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          textAlign: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px dashed var(--border-light)"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 18,
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: 1
          }, children: "CLÍNICA DENTAL AZULA2" }),
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 4
          }, children: "Sistema Azula Dent" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          textAlign: "center",
          marginBottom: 20
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 13,
            color: "var(--text-muted)"
          }, children: "COMPROBANTE DE PAGO" }),
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 4
          }, children: [
            "N° ",
            String(printPago.id).padStart(6, "0")
          ] })
        ] }),
        [{
          label: "Paciente",
          value: printPago.pacienteNombre
        }, {
          label: "Concepto",
          value: printPago.concepto
        }, {
          label: "Fecha",
          value: printPago.fechaPago ? (/* @__PURE__ */ new Date(printPago.fechaPago + "T00:00:00")).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : new Date(printPago.creadoEn).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        }, {
          label: "Estado",
          value: printPago.estado === "pagado" ? "PAGADO" : "PENDIENTE"
        }].map((row) => /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
          borderBottom: "1px solid var(--border)",
          fontSize: 14
        }, children: [
          /* @__PURE__ */ jsxs("span", { style: {
            color: "var(--text-muted)"
          }, children: [
            row.label,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { style: {
            color: "var(--text-primary)",
            fontWeight: 500,
            textAlign: "right"
          }, children: row.value })
        ] }, row.label)),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 0 0",
          fontSize: 18,
          fontWeight: 800
        }, children: [
          /* @__PURE__ */ jsx("span", { style: {
            color: "var(--text-secondary)"
          }, children: "TOTAL:" }),
          /* @__PURE__ */ jsxs("span", { style: {
            color: "var(--accent)"
          }, children: [
            "S/ ",
            parseFloat(printPago.monto).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          textAlign: "center",
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px dashed var(--border-light)",
          fontSize: 12,
          color: "var(--text-muted)"
        }, children: "Gracias por su confianza — Clínica Dental Azula2" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
        /* @__PURE__ */ jsx("button", { className: "btn-secondary", onClick: () => setPrintPago(null), children: "Cerrar" }),
        /* @__PURE__ */ jsxs("button", { className: "btn-primary", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsx(Printer, { size: 14 }),
          " Imprimir"
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(FacturacionGuard, {}) });
export {
  SplitComponent as component
};
