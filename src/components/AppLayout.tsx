import React, { useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuth } from '../lib/AuthContext.js'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Braces,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Stethoscope,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['administrador', 'odontologo', 'recepcionista'] },
  { to: '/pacientes', label: 'Pacientes', icon: Users, roles: ['administrador', 'odontologo', 'recepcionista'] },
  { to: '/agenda', label: 'Agenda y Citas', icon: Calendar, roles: ['administrador', 'odontologo', 'recepcionista'] },
  { to: '/ortodoncia', label: 'Ortodoncia', icon: Braces, roles: ['administrador', 'odontologo'] },
  { to: '/facturacion', label: 'Facturación', icon: Receipt, roles: ['administrador'] },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = routerState.location.pathname

  async function handleLogout() {
    await logout()
    navigate({ to: '/login' })
  }

  const visibleNav = NAV_ITEMS.filter(item =>
    user ? item.roles.includes(user.rol) : false
  )

  const rolLabel: Record<string, string> = {
    administrador: 'Administrador',
    odontologo: 'Odontólogo',
    recepcionista: 'Recepcionista',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 29, backdropFilter: 'blur(2px)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #00c8cc, #006d70)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stethoscope size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Azula Dent
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clínica Dental Azula2</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 8px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', paddingLeft: 16 }}>
            Módulos
          </div>
          {visibleNav.map((item) => {
            const active = currentPath.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item${active ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* User info */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar-circle" style={{ fontSize: 12 }}>
              {user?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nombre}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {rolLabel[user?.rol ?? ''] ?? user?.rol}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
              background: 'transparent', color: '#ef4444', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500', margin: 0 }}>
            © 2026 Azula2 - UNDAC
          </p>
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.7, margin: '2px 0 0 0' }}>
            Ingeniería de Software II
          </p>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-content" style={{ flex: 1 }}>
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none', background: 'transparent', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer', padding: 4,
              }}
              className="mobile-menu-btn"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {visibleNav.find(n => currentPath.startsWith(n.to))?.label ?? 'Azula Dent System'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {rolLabel[user?.rol ?? ''] ?? ''}
            </div>
            <div className="avatar-circle" style={{ fontSize: 12 }}>
              {user?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}
