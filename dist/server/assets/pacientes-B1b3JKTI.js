import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { A as AuthProvider, u as useAuth } from "./CursorTrail-BXftWP5l.js";
import { A as AppLayout } from "./AppLayout-LVbzYOvy.js";
import { UserPlus, Search, Users, Edit2, Trash2, X, AlertCircle, Save } from "lucide-react";
function PacientesGuard() {
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
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Pacientes, {}) });
}
function LoadingScreen() {
  return /* @__PURE__ */ jsx("div", { style: {
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
}
const EMPTY_FORM = {
  nombreCompleto: "",
  dni: "",
  celular: "",
  correo: "",
  direccion: "",
  fechaNacimiento: "",
  antecedentes: ""
};
function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    ...EMPTY_FORM
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const {
    user
  } = useAuth();
  const searchTimeout = useRef();
  async function loadPacientes(query = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/pacientes/?q=${encodeURIComponent(query)}`);
      if (res.ok) setPacientes(await res.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadPacientes();
  }, []);
  function handleSearch(val) {
    setQ(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => loadPacientes(val), 300);
  }
  function openNew() {
    setEditId(null);
    setForm({
      ...EMPTY_FORM
    });
    setErrors({});
    setApiError("");
    setShowModal(true);
  }
  function openEdit(p) {
    setEditId(p.id);
    setForm({
      nombreCompleto: p.nombreCompleto,
      dni: p.dni,
      celular: p.celular ?? "",
      correo: p.correo ?? "",
      direccion: p.direccion ?? "",
      fechaNacimiento: p.fechaNacimiento ?? "",
      antecedentes: p.antecedentes ?? ""
    });
    setErrors({});
    setApiError("");
    setShowModal(true);
  }
  function validate() {
    const e = {};
    if (!form.nombreCompleto.trim()) e.nombreCompleto = "El nombre es requerido";
    if (!form.dni.trim()) e.dni = "El DNI es requerido";
    else if (!/^\d{7,8}$/.test(form.dni.trim())) e.dni = "DNI inválido (7-8 dígitos)";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";
    return e;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      const url = editId ? `/api/pacientes/${editId}` : "/api/pacientes/";
      const method = editId ? "PUT" : "POST";
      const payload = {
        ...form,
        fechaNacimiento: form.fechaNacimiento || null,
        celular: form.celular || null,
        correo: form.correo || null,
        direccion: form.direccion || null,
        antecedentes: form.antecedentes || null
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        setApiError(d.error || "Error al guardar");
        return;
      }
      setShowModal(false);
      loadPacientes(q);
    } finally {
      setSubmitting(false);
    }
  }
  async function handleDelete(id) {
    await fetch(`/api/pacientes/${id}`, {
      method: "DELETE"
    });
    setDeleteConfirm(null);
    loadPacientes(q);
  }
  const canEdit = user?.rol !== "recepcionista";
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
        }, children: "Gestión de Pacientes" }),
        /* @__PURE__ */ jsxs("p", { style: {
          fontSize: 14,
          color: "var(--text-muted)"
        }, children: [
          pacientes.length,
          " paciente",
          pacientes.length !== 1 ? "s" : "",
          " registrado",
          pacientes.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn-primary", onClick: openNew, children: [
        /* @__PURE__ */ jsx(UserPlus, { size: 16 }),
        "Registrar Paciente"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "search-bar", style: {
      marginBottom: 20,
      maxWidth: 380
    }, children: [
      /* @__PURE__ */ jsx(Search, { size: 16, className: "search-icon" }),
      /* @__PURE__ */ jsx("input", { className: "input-field", placeholder: "Buscar por nombre o DNI...", value: q, onChange: (e) => handleSearch(e.target.value) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card", style: {
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsx("div", { className: "table-container", children: loading ? /* @__PURE__ */ jsxs("div", { style: {
      padding: 48,
      textAlign: "center",
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
      "Cargando pacientes..."
    ] }) : pacientes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx(Users, { size: 44 }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 6
      }, children: q ? "No se encontraron pacientes" : "Sin pacientes registrados" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 13
      }, children: q ? "Intente con otro nombre o DNI" : "Registre el primer paciente usando el botón superior" })
    ] }) : /* @__PURE__ */ jsxs("table", { children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Paciente" }),
        /* @__PURE__ */ jsx("th", { children: "DNI" }),
        /* @__PURE__ */ jsx("th", { children: "Celular" }),
        /* @__PURE__ */ jsx("th", { children: "Correo" }),
        /* @__PURE__ */ jsx("th", { children: "F. Nacimiento" }),
        /* @__PURE__ */ jsx("th", { children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: pacientes.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "initials-circle", children: p.nombreCompleto.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: 14
            }, children: p.nombreCompleto }),
            p.direccion && /* @__PURE__ */ jsx("div", { style: {
              fontSize: 12,
              color: "var(--text-muted)"
            }, children: p.direccion })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("td", { style: {
          fontFamily: "monospace",
          fontSize: 14
        }, children: p.dni }),
        /* @__PURE__ */ jsx("td", { children: p.celular ?? /* @__PURE__ */ jsx("span", { style: {
          color: "var(--text-muted)"
        }, children: "—" }) }),
        /* @__PURE__ */ jsx("td", { style: {
          fontSize: 13
        }, children: p.correo ?? /* @__PURE__ */ jsx("span", { style: {
          color: "var(--text-muted)"
        }, children: "—" }) }),
        /* @__PURE__ */ jsx("td", { children: p.fechaNacimiento ? (/* @__PURE__ */ new Date(p.fechaNacimiento + "T00:00:00")).toLocaleDateString("es-PE") : /* @__PURE__ */ jsx("span", { style: {
          color: "var(--text-muted)"
        }, children: "—" }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          gap: 6
        }, children: [
          /* @__PURE__ */ jsxs("button", { className: "btn-secondary btn-sm", onClick: () => openEdit(p), children: [
            /* @__PURE__ */ jsx(Edit2, { size: 13 }),
            " Editar"
          ] }),
          canEdit && /* @__PURE__ */ jsxs("button", { className: "btn-danger btn-sm", onClick: () => setDeleteConfirm(p.id), children: [
            /* @__PURE__ */ jsx(Trash2, { size: 13 }),
            " Eliminar"
          ] })
        ] }) })
      ] }, p.id)) })
    ] }) }) }),
    showModal && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: (e) => {
      if (e.target === e.currentTarget) setShowModal(false);
    }, children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: editId ? "Editar Paciente" : "Registrar Paciente" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: 4
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
              /* @__PURE__ */ jsx("label", { children: "Nombre Completo *" }),
              /* @__PURE__ */ jsx("input", { className: `input-field${errors.nombreCompleto ? " border-red" : ""}`, value: form.nombreCompleto, onChange: (e) => setForm((f) => ({
                ...f,
                nombreCompleto: e.target.value
              })), placeholder: "Ej: Juan Carlos Pérez" }),
              errors.nombreCompleto && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.nombreCompleto })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "DNI *" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", value: form.dni, onChange: (e) => setForm((f) => ({
                ...f,
                dni: e.target.value
              })), placeholder: "12345678", maxLength: 8 }),
              errors.dni && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.dni })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Celular" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", value: form.celular, onChange: (e) => setForm((f) => ({
                ...f,
                celular: e.target.value
              })), placeholder: "987654321" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Correo Electrónico" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "email", value: form.correo, onChange: (e) => setForm((f) => ({
                ...f,
                correo: e.target.value
              })), placeholder: "correo@ejemplo.com" }),
              errors.correo && /* @__PURE__ */ jsx("span", { style: {
                fontSize: 12,
                color: "#f87171"
              }, children: errors.correo })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { children: "Fecha de Nacimiento" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", type: "date", value: form.fechaNacimiento, onChange: (e) => setForm((f) => ({
                ...f,
                fechaNacimiento: e.target.value
              })) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Dirección" }),
              /* @__PURE__ */ jsx("input", { className: "input-field", value: form.direccion, onChange: (e) => setForm((f) => ({
                ...f,
                direccion: e.target.value
              })), placeholder: "Av. Principal 123, Lima" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
              gridColumn: "1 / -1"
            }, children: [
              /* @__PURE__ */ jsx("label", { children: "Antecedentes Médicos" }),
              /* @__PURE__ */ jsx("textarea", { className: "input-field", value: form.antecedentes, onChange: (e) => setForm((f) => ({
                ...f,
                antecedentes: e.target.value
              })), placeholder: "Alergias, enfermedades crónicas, medicamentos actuales...", rows: 3, style: {
                resize: "vertical"
              } })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: () => setShowModal(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "btn-primary", disabled: submitting, children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            submitting ? "Guardando..." : editId ? "Guardar Cambios" : "Registrar Paciente"
          ] })
        ] })
      ] })
    ] }) }),
    deleteConfirm !== null && /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", style: {
      maxWidth: 400
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)"
        }, children: "Confirmar Eliminación" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDeleteConfirm(null), style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)"
        }, children: /* @__PURE__ */ jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "modal-body", children: /* @__PURE__ */ jsx("p", { style: {
        color: "var(--text-secondary)",
        fontSize: 14
      }, children: "¿Está seguro de que desea eliminar este paciente? Esta acción también eliminará todas sus citas y pagos asociados." }) }),
      /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
        /* @__PURE__ */ jsx("button", { className: "btn-secondary", onClick: () => setDeleteConfirm(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { className: "btn-danger", onClick: () => handleDelete(deleteConfirm), children: [
          /* @__PURE__ */ jsx(Trash2, { size: 14 }),
          " Eliminar"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
        .border-red { border-color: rgba(239,68,68,0.5) !important; }
      ` })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(PacientesGuard, {}) });
export {
  SplitComponent as component
};
