import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refetch: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  refetch: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // --- SIMULACIÓN DE SESIÓN ACTIVA AL RECARGAR ---
  async function fetchMe() {
    try {
      // Intentamos leer si ya dejamos un usuario guardado en el navegador
      const savedUser = localStorage.getItem('azula_session')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  // --- LOGIN TRUCADO EN TEXTO PLANO ---
  async function login(email: string, password: string) {
    setLoading(true)

    // Mapeo local de credenciales exactas de simulación
    if (email === 'admin@azuladent.com' && password === 'admin123') {
      const mockUser = { id: 1, nombre: 'Administrador Azula', email, rol: 'administrador' }
      setUser(mockUser)
      localStorage.setItem('azula_session', JSON.stringify(mockUser))
      setLoading(false)
      return {}
    } 
    
    if (email === 'dentista@azuladent.com' && password === 'dent123') {
      const mockUser = { id: 2, nombre: 'Odontólogo de Turno', email, rol: 'odontologo' }
      setUser(mockUser)
      localStorage.setItem('azula_session', JSON.stringify(mockUser))
      setLoading(false)
      return {}
    } 
    
    if (email === 'recep@azuladent.com' && password === 'recep123') {
      const mockUser = { id: 3, nombre: 'Recepcionista Principal', email, rol: 'recepcionista' }
      setUser(mockUser)
      localStorage.setItem('azula_session', JSON.stringify(mockUser))
      setLoading(false)
      return {}
    }

    setLoading(false)
    return { error: 'Credenciales de demostración incorrectas' }
  }

  // --- CERRAR SESIÓN SIMULADO ---
  async function logout() {
    localStorage.removeItem('azula_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)