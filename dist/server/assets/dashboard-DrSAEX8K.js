import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { A as AuthProvider, u as useAuth } from "./CursorTrail-BXftWP5l.js";
import { A as AppLayout } from "./AppLayout-LVbzYOvy.js";
import { Calendar, DollarSign, Braces, CheckCircle2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
function DashboardGuard() {
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
  if (loading) return /* @__PURE__ */ jsx(LoadingScreen, {});
  if (!user) return null;
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Dashboard, {}) });
}
function LoadingScreen() {
  return /* @__PURE__ */ jsx("div", { style: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, children: /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      width: 40,
      height: 40,
      border: "3px solid var(--border)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    } }),
    /* @__PURE__ */ jsx("span", { style: {
      color: "var(--text-muted)",
      fontSize: 14
    }, children: "Cargando..." })
  ] }) });
}
const ESPECIALIDAD_LABEL = {
  odontologia_general: "Odontología General",
  ortodoncia: "Ortodoncia",
  endodoncia: "Endodoncia"
};
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(null);
  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadStats();
  }, []);
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
    loadStats();
  }
  const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      marginBottom: 28
    }, children: [
      /* @__PURE__ */ jsx("h1", { style: {
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-primary)",
        marginBottom: 4
      }, children: "Panel de Control" }),
      /* @__PURE__ */ jsx("p", { style: {
        fontSize: 14,
        color: "var(--text-muted)",
        textTransform: "capitalize"
      }, children: todayStr })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      marginBottom: 28
    }, children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { size: 20 }), label: "Citas de Hoy", value: loading ? "—" : String(stats?.citasHoy.length ?? 0), color: "#3b82f6" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(DollarSign, { size: 20 }), label: "Pagos Pendientes del Mes", value: loading ? "—" : `S/ ${parseFloat(stats?.totalPendienteMes ?? "0").toLocaleString("es-PE", {
        minimumFractionDigits: 2
      })}`, color: "#f59e0b" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Braces, { size: 20 }), label: "Tratamientos Activos", value: loading ? "—" : String(stats?.tratamientosActivos ?? 0), color: "#1A4B8C" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 20 }), label: "Total Cobrado del Mes", value: loading ? "—" : `S/ ${parseFloat(stats?.totalCobradoMes ?? "0").toLocaleString("es-PE", {
        minimumFractionDigits: 2
      })}`, color: "#1A4B8C" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr)",
      gap: 20
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 0,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 8
          }, children: [
            /* @__PURE__ */ jsx(Calendar, { size: 16, className: "icon icon-accent" }),
            /* @__PURE__ */ jsx("span", { style: {
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: 15
            }, children: "Orden del Día" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: loadStats, style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 4
          }, children: /* @__PURE__ */ jsx(RefreshCw, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsx("div", { children: loading ? /* @__PURE__ */ jsxs("div", { style: {
          padding: 32,
          textAlign: "center",
          color: "var(--text-muted)"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 24,
            height: 24,
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 8px"
          } }),
          "Cargando citas..."
        ] }) : stats?.citasHoy.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(Calendar, { size: 40 }),
          /* @__PURE__ */ jsx("div", { children: "No hay citas programadas para hoy" })
        ] }) : stats?.citasHoy.map((cita) => /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          transition: "background 0.15s"
        }, onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)", onMouseLeave: (e) => e.currentTarget.style.background = "transparent", children: [
          /* @__PURE__ */ jsx("div", { className: "initials-circle", children: getInitials(cita.paciente.nombreCompleto) }),
          /* @__PURE__ */ jsxs("div", { style: {
            flex: 1
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: 14
            }, children: cita.paciente.nombreCompleto }),
            /* @__PURE__ */ jsx("div", { style: {
              fontSize: 12,
              color: "var(--text-muted)"
            }, children: ESPECIALIDAD_LABEL[cita.especialidad] ?? cita.especialidad })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--accent)",
            fontSize: 13,
            fontWeight: 600
          }, children: [
            /* @__PURE__ */ jsx(Clock, { size: 13 }),
            cita.hora
          ] })
        ] }, cita.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: {
        padding: 0,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }, children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 16, className: "icon icon-warning" }),
          /* @__PURE__ */ jsx("span", { style: {
            fontWeight: 600,
            color: "var(--text-primary)",
            fontSize: 15
          }, children: "Pagos Pendientes" })
        ] }),
        /* @__PURE__ */ jsx("div", { children: loading ? /* @__PURE__ */ jsx("div", { style: {
          padding: 32,
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
        } }) }) : stats?.pagosPendientesMes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 36 }),
          /* @__PURE__ */ jsx("div", { children: "Sin pagos pendientes este mes" })
        ] }) : stats?.pagosPendientesMes.slice(0, 8).map((pago) => /* @__PURE__ */ jsxs("div", { style: {
          padding: "13px 16px",
          borderBottom: "1px solid var(--border)"
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 8
          }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: {
                fontWeight: 600,
                color: "var(--text-primary)",
                fontSize: 13
              }, children: pago.paciente.nombreCompleto }),
              /* @__PURE__ */ jsx("div", { style: {
                fontSize: 12,
                color: "var(--text-muted)"
              }, children: pago.concepto })
            ] }),
            /* @__PURE__ */ jsxs("span", { style: {
              fontWeight: 700,
              color: "#f59e0b",
              fontSize: 14,
              whiteSpace: "nowrap"
            }, children: [
              "S/ ",
              parseFloat(pago.monto).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "btn-success btn-sm", style: {
            width: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
            gap: 6
          }, onClick: () => marcarPagado(pago.id), disabled: markingPaid === pago.id, children: [
            /* @__PURE__ */ jsx(CheckCircle2, { size: 13 }),
            markingPaid === pago.id ? "Procesando..." : "Marcar Pagado"
          ] })
        ] }, pago.id)) })
      ] })
    ] })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  color
}) {
  return /* @__PURE__ */ jsxs("div", { className: "card", style: {
    padding: "20px 22px"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `${color}1a`,
        border: `1px solid ${color}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color
      }, children: icon }),
      /* @__PURE__ */ jsx("span", { style: {
        fontSize: 13,
        color: "var(--text-muted)",
        fontWeight: 500
      }, children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      fontSize: 24,
      fontWeight: 700,
      color: "var(--text-primary)"
    }, children: value })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(DashboardGuard, {}) });
export {
  SplitComponent as component
};
