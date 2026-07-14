import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { A as AuthProvider, u as useAuth, C as CursorTrail } from "./CursorTrail-BXftWP5l.js";
import { AlertCircle, EyeOff, Eye } from "lucide-react";
function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    user,
    loading
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!loading && user) {
      navigate({
        to: "/dashboard"
      });
    }
  }, [user, loading]);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor ingrese email y contraseña");
      return;
    }
    setSubmitting(true);
    if (email === "admin@azuladent.com" && password === "admin123" || email === "dentista@azuladent.com" && password === "dent123" || email === "recep@azuladent.com" && password === "recep123") {
      try {
        await login(email, password);
        setSubmitting(false);
        navigate({
          to: "/dashboard"
        });
      } catch (err) {
        setSubmitting(false);
        navigate({
          to: "/dashboard"
        });
      }
    } else {
      setSubmitting(false);
      setError("Credenciales incorrectas");
    }
  }
  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 480);
      return () => clearTimeout(t);
    }
  }, [error]);
  return /* @__PURE__ */ jsxs("div", { style: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsx(CursorTrail, {}),
    /* @__PURE__ */ jsx("div", { className: "login-decor-blob blob-1 blob-ani" }),
    /* @__PURE__ */ jsx("div", { className: "login-decor-blob blob-2 blob-ani" }),
    /* @__PURE__ */ jsxs("div", { style: {
      width: "100%",
      maxWidth: 420,
      animation: "fadeIn 0.4s ease-out"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        textAlign: "center",
        marginBottom: 40
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(135deg, #00c8cc 0%, #006d70 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 0 40px rgba(26,75,140,0.18)"
        }, children: /* @__PURE__ */ jsx("img", { src: "/favicon-source.png", alt: "Azula Dent logo", style: {
          width: 64,
          height: 64,
          borderRadius: 14,
          objectFit: "cover"
        } }) }),
        /* @__PURE__ */ jsx("h1", { style: {
          fontSize: 26,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6
        }, children: "Azula Dent System" }),
        /* @__PURE__ */ jsx("p", { style: {
          fontSize: 14,
          color: "var(--text-muted)"
        }, children: "Clínica Dental Azula2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `card ${shake ? "form-shake" : ""}`, style: {
        padding: "32px"
      }, children: [
        /* @__PURE__ */ jsx("h2", { style: {
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 24
        }, children: "Iniciar Sesión" }),
        error && /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 20,
          color: "#f87171",
          fontSize: 14
        }, children: [
          /* @__PURE__ */ jsx(AlertCircle, { size: 15 }),
          error
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsx("div", { className: "form-group", children: /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
            /* @__PURE__ */ jsx("input", { type: "email", className: "input-field", placeholder: "", value: email, onChange: (e) => setEmail(e.target.value), onFocus: () => setFocusEmail(true), onBlur: () => setFocusEmail(false), autoComplete: "email", autoFocus: true }),
            /* @__PURE__ */ jsx("label", { className: focusEmail || email ? "active" : "", children: "Correo Electrónico" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", style: {
            position: "relative"
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
              /* @__PURE__ */ jsx("input", { type: showPass ? "text" : "password", className: "input-field", placeholder: "", value: password, onChange: (e) => setPassword(e.target.value), onFocus: () => setFocusPass(true), onBlur: () => setFocusPass(false), style: {
                paddingRight: 44
              }, autoComplete: "current-password" }),
              /* @__PURE__ */ jsx("label", { className: focusPass || password ? "active" : "", children: "Contraseña" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPass(!showPass), style: {
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(6px)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 2
            }, children: showPass ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary", style: {
            width: "100%",
            justifyContent: "center",
            marginTop: 8
          }, disabled: submitting, children: submitting ? /* @__PURE__ */ jsxs("span", { style: {
            display: "flex",
            alignItems: "center",
            gap: 8
          }, children: [
            /* @__PURE__ */ jsx("span", { style: {
              width: 14,
              height: 14,
              border: "2px solid transparent",
              borderTopColor: "currentColor",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite"
            } }),
            "Iniciando sesión..."
          ] }) : "Iniciar Sesión" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          marginTop: 24,
          padding: "14px",
          background: "var(--bg-secondary)",
          borderRadius: 8,
          border: "1px solid var(--border)"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 12,
            color: "var(--text-muted)",
            fontWeight: 600,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }, children: "Accesos de demostración" }),
          [{
            rol: "Administrador",
            email: "admin@azuladent.com",
            pass: "admin123"
          }, {
            rol: "Odontólogo",
            email: "dentista@azuladent.com",
            pass: "dent123"
          }, {
            rol: "Recepcionista",
            email: "recep@azuladent.com",
            pass: "recep123"
          }].map((cred) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
            setEmail(cred.email);
            setPassword(cred.pass);
          }, style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "6px 10px",
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: 13,
            transition: "background 0.15s",
            marginBottom: 4
          }, onMouseEnter: (e) => e.currentTarget.style.background = "var(--bg-card)", onMouseLeave: (e) => e.currentTarget.style.background = "transparent", children: [
            /* @__PURE__ */ jsx("span", { style: {
              fontWeight: 500
            }, children: cred.rol }),
            /* @__PURE__ */ jsx("span", { style: {
              color: "var(--text-muted)",
              fontSize: 12
            }, children: cred.email })
          ] }, cred.rol))
        ] })
      ] })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(LoginPage, {}) });
export {
  SplitComponent as component
};
