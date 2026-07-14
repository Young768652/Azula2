import { jsx } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext, useRef } from "react";
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {
  },
  refetch: () => {
  }
});
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  async function fetchMe() {
    try {
      const savedUser = localStorage.getItem("azula_session");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchMe();
  }, []);
  async function login(email, password) {
    setLoading(true);
    if (email === "admin@azuladent.com" && password === "admin123") {
      const mockUser = { id: 1, nombre: "Administrador Azula", email, rol: "administrador" };
      setUser(mockUser);
      localStorage.setItem("azula_session", JSON.stringify(mockUser));
      setLoading(false);
      return {};
    }
    if (email === "dentista@azuladent.com" && password === "dent123") {
      const mockUser = { id: 2, nombre: "Odontólogo de Turno", email, rol: "odontologo" };
      setUser(mockUser);
      localStorage.setItem("azula_session", JSON.stringify(mockUser));
      setLoading(false);
      return {};
    }
    if (email === "recep@azuladent.com" && password === "recep123") {
      const mockUser = { id: 3, nombre: "Recepcionista Principal", email, rol: "recepcionista" };
      setUser(mockUser);
      localStorage.setItem("azula_session", JSON.stringify(mockUser));
      setLoading(false);
      return {};
    }
    setLoading(false);
    return { error: "Credenciales de demostración incorrectas" };
  }
  async function logout() {
    localStorage.removeItem("azula_session");
    setUser(null);
  }
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, loading, login, logout, refetch: fetchMe }, children });
}
const useAuth = () => useContext(AuthContext);
const TRAIL_COUNT = 6;
function CursorTrail() {
  const trailRefs = useRef(Array(TRAIL_COUNT).fill(null));
  const positionsRef = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -1e3, y: -1e3 })));
  const pointerRef = useRef({ x: -1e3, y: -1e3 });
  const rafRef = useRef(null);
  useEffect(() => {
    const handleMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove);
    const animate = () => {
      const p = pointerRef.current;
      const pos = positionsRef.current;
      pos[0].x += (p.x - pos[0].x) * 0.1;
      pos[0].y += (p.y - pos[0].y) * 0.1;
      for (let i = 1; i < TRAIL_COUNT; i++) {
        pos[i].x += (pos[i - 1].x - pos[i].x) * 0.15;
        pos[i].y += (pos[i - 1].y - pos[i].y) * 0.15;
      }
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        el.style.transform = `translate(${pos[i].x - 1}px, ${pos[i].y - 1}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "cursor-trail", "aria-hidden": true, children: Array.from({ length: TRAIL_COUNT }).map((_, i) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: (el) => {
        if (el) trailRefs.current[i] = el;
      },
      className: "cursor-seg",
      style: { left: 0, top: 0 }
    },
    i
  )) });
}
export {
  AuthProvider as A,
  CursorTrail as C,
  useAuth as u
};
