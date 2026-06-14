import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from '../lib/AuthContext.js'
import { AppLayout } from '../components/AppLayout.js'
import {
  UserPlus, Search, Edit2, Trash2, X, Save, Users,
  Phone, Mail, MapPin, Calendar, FileText, AlertCircle,
  ChevronDown,
} from 'lucide-react'

export const Route = createFileRoute('/pacientes')({
  component: () => (
    <AuthProvider>
      <PacientesGuard />
    </AuthProvider>
  ),
})

function PacientesGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading])
  if (loading) return <LoadingScreen />
  if (!user) return null
  return <AppLayout><Pacientes /></AppLayout>
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

interface Paciente {
  id: number
  nombreCompleto: string
  dni: string
  celular: string | null
  correo: string | null
  direccion: string | null
  fechaNacimiento: string | null
  antecedentes: string | null
  creadoEn: string
}

const EMPTY_FORM = {
  nombreCompleto: '', dni: '', celular: '', correo: '',
  direccion: '', fechaNacimiento: '', antecedentes: '',
}

function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const { user } = useAuth()
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()

  async function loadPacientes(query = '') {
    setLoading(true)
    try {
      const res = await fetch(`/api/pacientes/?q=${encodeURIComponent(query)}`)
      if (res.ok) setPacientes(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPacientes() }, [])

  function handleSearch(val: string) {
    setQ(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => loadPacientes(val), 300)
  }

  function openNew() {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setApiError('')
    setShowModal(true)
  }

  function openEdit(p: Paciente) {
    setEditId(p.id)
    setForm({
      nombreCompleto: p.nombreCompleto,
      dni: p.dni,
      celular: p.celular ?? '',
      correo: p.correo ?? '',
      direccion: p.direccion ?? '',
      fechaNacimiento: p.fechaNacimiento ?? '',
      antecedentes: p.antecedentes ?? '',
    })
    setErrors({})
    setApiError('')
    setShowModal(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.nombreCompleto.trim()) e.nombreCompleto = 'El nombre es requerido'
    if (!form.dni.trim()) e.dni = 'El DNI es requerido'
    else if (!/^\d{7,8}$/.test(form.dni.trim())) e.dni = 'DNI inválido (7-8 dígitos)'
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)
    try {
      const url = editId ? `/api/pacientes/${editId}` : '/api/pacientes/'
      const method = editId ? 'PUT' : 'POST'
      const payload = {
        ...form,
        fechaNacimiento: form.fechaNacimiento || null,
        celular: form.celular || null,
        correo: form.correo || null,
        direccion: form.direccion || null,
        antecedentes: form.antecedentes || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        setApiError(d.error || 'Error al guardar')
        return
      }
      setShowModal(false)
      loadPacientes(q)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    loadPacientes(q)
  }

  const canEdit = user?.rol !== 'recepcionista'

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Gestión de Pacientes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <UserPlus size={16} />
          Registrar Paciente
        </button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 20, maxWidth: 380 }}>
        <Search size={16} className="search-icon" />
        <input
          className="input-field"
          placeholder="Buscar por nombre o DNI..."
          value={q}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Cargando pacientes...
            </div>
          ) : pacientes.length === 0 ? (
            <div className="empty-state">
              <Users size={44} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                {q ? 'No se encontraron pacientes' : 'Sin pacientes registrados'}
              </div>
              <div style={{ fontSize: 13 }}>
                {q ? 'Intente con otro nombre o DNI' : 'Registre el primer paciente usando el botón superior'}
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>DNI</th>
                  <th>Celular</th>
                  <th>Correo</th>
                  <th>F. Nacimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="initials-circle">{p.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{p.nombreCompleto}</div>
                          {p.direccion && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.direccion}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 14 }}>{p.dni}</td>
                    <td>{p.celular ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ fontSize: 13 }}>{p.correo ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {p.fechaNacimiento
                        ? new Date(p.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-PE')
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>
                          <Edit2 size={13} /> Editar
                        </button>
                        {canEdit && (
                          <button className="btn-danger btn-sm" onClick={() => setDeleteConfirm(p.id)}>
                            <Trash2 size={13} /> Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Registrar/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                {editId ? 'Editar Paciente' : 'Registrar Paciente'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {apiError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
                    <AlertCircle size={14} />
                    {apiError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nombre Completo *</label>
                    <input className={`input-field${errors.nombreCompleto ? ' border-red' : ''}`} value={form.nombreCompleto} onChange={e => setForm(f => ({ ...f, nombreCompleto: e.target.value }))} placeholder="Ej: Juan Carlos Pérez" />
                    {errors.nombreCompleto && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.nombreCompleto}</span>}
                  </div>
                  <div className="form-group">
                    <label>DNI *</label>
                    <input className="input-field" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} placeholder="12345678" maxLength={8} />
                    {errors.dni && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.dni}</span>}
                  </div>
                  <div className="form-group">
                    <label>Celular</label>
                    <input className="input-field" value={form.celular} onChange={e => setForm(f => ({ ...f, celular: e.target.value }))} placeholder="987654321" />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input className="input-field" type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} placeholder="correo@ejemplo.com" />
                    {errors.correo && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.correo}</span>}
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input className="input-field" type="date" value={form.fechaNacimiento} onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Dirección</label>
                    <input className="input-field" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Av. Principal 123, Lima" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Antecedentes Médicos</label>
                    <textarea
                      className="input-field"
                      value={form.antecedentes}
                      onChange={e => setForm(f => ({ ...f, antecedentes: e.target.value }))}
                      placeholder="Alergias, enfermedades crónicas, medicamentos actuales..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={15} />
                  {submitting ? 'Guardando...' : editId ? 'Guardar Cambios' : 'Registrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Confirmar Eliminación</h2>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                ¿Está seguro de que desea eliminar este paciente? Esta acción también eliminará todas sus citas y pagos asociados.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm!)}>
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .border-red { border-color: rgba(239,68,68,0.5) !important; }
      `}</style>
    </div>
  )
}
