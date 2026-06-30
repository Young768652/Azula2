import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { u as useAuth, C as CursorTrail } from "./CursorTrail-BXftWP5l.js";
import { LayoutDashboard, Users, Calendar, Braces, Receipt, LogOut, X, Menu } from "lucide-react";
const NAV_ITEMS = [
  { to: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, roles: ["administrador", "odontologo", "recepcionista"] },
  { to: "/pacientes", label: "Pacientes", icon: Users, roles: ["administrador", "odontologo", "recepcionista"] },
  { to: "/agenda", label: "Agenda y Citas", icon: Calendar, roles: ["administrador", "odontologo", "recepcionista"] },
  { to: "/ortodoncia", label: "Ortodoncia", icon: Braces, roles: ["administrador", "odontologo"] },
  { to: "/facturacion", label: "Facturación", icon: Receipt, roles: ["administrador"] }
];
function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const currentPath = routerState.location.pathname;
  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3e3);
  }
  const visibleNav = NAV_ITEMS.filter(
    (item) => user ? item.roles.includes(user.rol) : false
  );
  const rolLabel = {
    administrador: "Administrador",
    odontologo: "Odontólogo",
    recepcionista: "Recepcionista"
  };
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsx(CursorTrail, {}),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 29,
          backdropFilter: "blur(2px)"
        },
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "nav",
      {
        className: `sidebar${sidebarOpen ? " open" : ""}`,
        style: { fontFamily: "Inter, system-ui, sans-serif" },
        children: [
          /* @__PURE__ */ jsx("div", { style: {
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border)"
          }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/favicon-source.png",
                alt: "Azula Dent logo",
                style: { width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }, children: "Azula Dent" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "var(--text-muted)" }, children: "Clínica Dental Azula2" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, padding: "12px 0", overflowY: "auto" }, children: [
            /* @__PURE__ */ jsx("div", { style: { padding: "0 8px 8px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: 16 }, children: "Módulos" }),
            visibleNav.map((item) => {
              const active = currentPath.startsWith(item.to);
              return /* @__PURE__ */ jsxs(
                Link,
                {
                  to: item.to,
                  className: `sidebar-nav-item${active ? " active" : ""}`,
                  onClick: () => setSidebarOpen(false),
                  children: [
                    /* @__PURE__ */ jsx(item.icon, { size: 16 }),
                    item.label
                  ]
                },
                item.to
              );
            })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            padding: "16px",
            borderTop: "1px solid var(--border)",
            background: "#ffffff",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsx("div", { className: "avatar-circle", style: { fontSize: 12 }, children: user?.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: user?.nombre }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "var(--text-muted)" }, children: rolLabel[user?.rol ?? ""] ?? user?.rol })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleLogout,
                style: {
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "transparent",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { size: 14 }),
                  "Cerrar Sesión"
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { style: { marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", textAlign: "center" }, children: [
              /* @__PURE__ */ jsx("p", { style: { fontSize: "10px", color: "var(--text-muted)", fontWeight: "500", margin: 0 }, children: "© 2026 Azula2 - UNDAC" }),
              /* @__PURE__ */ jsx("p", { style: { fontSize: "9px", color: "var(--text-muted)", opacity: 0.7, margin: "2px 0 0 0" }, children: "Ingeniería de Software II" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "main-content", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsxs("div", { className: "topbar", children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSidebarOpen(!sidebarOpen),
              style: {
                display: "none",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 4
              },
              className: "mobile-menu-btn",
              children: sidebarOpen ? /* @__PURE__ */ jsx(X, { size: 20 }) : /* @__PURE__ */ jsx(Menu, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: "var(--text-muted)" }, children: visibleNav.find((n) => currentPath.startsWith(n.to))?.label ?? "Azula Dent System" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "var(--text-muted)" }, children: rolLabel[user?.rol ?? ""] ?? "" }),
          /* @__PURE__ */ jsx("div", { className: "avatar-circle", style: { fontSize: 12 }, children: user?.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "page-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "hero card--elevated", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "title", children: "Bienvenido a Azula Dent" }),
            /* @__PURE__ */ jsx("div", { className: "subtitle", children: "Panel centralizado — gestión de citas, pacientes y facturación" }),
            /* @__PURE__ */ jsxs("div", { style: { marginTop: 12, display: "flex", gap: 8 }, children: [
              /* @__PURE__ */ jsx("button", { className: "btn-primary large", onClick: () => {
                showToast("Navegando a agenda...");
                navigate({ to: "/agenda" });
              }, children: "Nueva Cita" }),
              /* @__PURE__ */ jsx("button", { className: "btn-secondary", onClick: () => {
                showToast("Abriendo lista de pacientes");
                navigate({ to: "/pacientes" });
              }, children: "Ver Pacientes" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
            /* @__PURE__ */ jsx("div", { className: "hero-decor floaty", children: "AD" }),
            /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
              /* @__PURE__ */ jsx("div", { className: "fancy-badge", children: "Versión Demo" }),
              /* @__PURE__ */ jsx("div", { style: { marginTop: 8, fontSize: 12, color: "var(--text-muted)" }, children: "Última actividad: Ahora" })
            ] })
          ] })
        ] }),
        children
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      ` }),
    /* @__PURE__ */ jsx("div", { className: "fab", children: /* @__PURE__ */ jsx("button", { "aria-label": "Nueva Cita", onClick: () => {
      showToast("Nueva cita");
      navigate({ to: "/agenda" });
    }, children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" }) }) }) }),
    /* @__PURE__ */ jsx("div", { className: "toast-portal", "aria-live": "polite", children: toast && /* @__PURE__ */ jsx("div", { className: "toast", children: toast }) })
  ] });
}
export {
  AppLayout as A
};
