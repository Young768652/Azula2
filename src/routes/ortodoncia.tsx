import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '../lib/AuthContext.js'
import { AppLayout } from '../components/AppLayout.js'
import {
  Braces, Plus, X, Save, ChevronDown, ChevronUp,
  AlertCircle, PlusCircle, DollarSign, Clock,
  RefreshCw, CheckCircle2,
} from 'lucide-react'

export const Route = createFileRoute('/ortodoncia')({
  component: () => (
    <AuthProvider>
      <OrtodonciaGuard />
    </AuthProvider>
  ),
})

function OrtodonciaGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
    if (!loading && user && !['administrador', 'odontologo'].includes(user.rol)) navigate({ to: '/dashboard' })
  }, [user, loading])
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
  if (!user) return null
  return <AppLayout><Ortodoncia /></AppLayout>
}

interface Tratamiento {
  id: number
  pacienteId: number
  pacienteNombre: string
  pacienteDni: string
  costoTotal: string
  cuotasPactadas: number
  saldoPendiente: string
  tipoArcoActual: string | null
  activo: boolean
  creadoEn: string
}

interface Nota {
  id: number
  nota: string
  arcoUsado: string | null
  montoPagado: string | null
  creadoEn: string
}

interface TratamientoDetalle extends Tratamiento {
  notas: Nota[]
}

interface Paciente { id: number; nombreCompleto: string }

const EMPTY_TRAT_FORM = { pacienteId: '', costoTotal: '', cuotasPactadas: '', tipoArcoActual: '' }
const EMPTY_NOTA_FORM = { nota: '', arcoUsado: '', montoPagado: '' }

function Ortodoncia() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTrat, setShowNewTrat] = useState(false)
  const [tratForm, setTratForm] = useState({ ...EMPTY_TRAT_FORM })
  const [tratErrors, setTratErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detalle, setDetalle] = useState<TratamientoDetalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [notaForm, setNotaForm] = useState({ ...EMPTY_NOTA_FORM })
  const [addingNota, setAddingNota] = useState(false)
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activo' | 'finalizado'>('activo')

  async function loadData() {
    setLoading(true)
    try {
      const [tratRes, pacRes] = await Promise.all([
        fetch('/api/ortodoncia/'),
        fetch('/api/pacientes/'),
      ])
      if (tratRes.ok) setTratamientos(await tratRes.json())
      if (pacRes.ok) setPacientes(await pacRes.json())
    } finally {
      setLoading(false)
    }
  }

  async function loadDetalle(id: number) {
    setLoadingDetalle(true)
    try {
      const res = await fetch(`/api/ortodoncia/${id}`)
      if (res.ok) setDetalle(await res.json())
    } finally {
      setLoadingDetalle(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
      setDetalle(null)
    } else {
      setExpandedId(id)
      setNotaForm({ ...EMPTY_NOTA_FORM })
      loadDetalle(id)
    }
  }

  function validateTrat() {
    const e: Record<string, string> = {}
    if (!tratForm.pacienteId) e.pacienteId = 'Seleccione un paciente'
    if (!tratForm.costoTotal || isNaN(Number(tratForm.costoTotal)) || Number(tratForm.costoTotal) <= 0) e.costoTotal = 'Ingrese un costo válido'
    if (!tratForm.cuotasPactadas || isNaN(Number(tratForm.cuotasPactadas)) || Number(tratForm.cuotasPactadas) <= 0) e.cuotasPactadas = 'Ingrese las cuotas'
    return e
  }

  async function handleNewTrat(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateTrat()
    if (Object.keys(errs).length > 0) { setTratErrors(errs); return }
    setTratErrors({})
    setApiError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/ortodoncia/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tratForm, costoTotal: Number(tratForm.costoTotal), cuotasPactadas: Number(tratForm.cuotasPactadas) }),
      })
      if (!res.ok) {
        const d = await res.json()
        setApiError(d.error || 'Error al guardar')
        return
      }
      setShowNewTrat(false)
      setTratForm({ ...EMPTY_TRAT_FORM })
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddNota(tratId: number) {
    if (!notaForm.nota.trim()) return
    setAddingNota(true)
    try {
      await fetch(`/api/ortodoncia/${tratId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nota: notaForm.nota,
          arcoUsado: notaForm.arcoUsado || null,
          montoPagado: notaForm.montoPagado ? Number(notaForm.montoPagado) : null,
        }),
      })
      setNotaForm({ ...EMPTY_NOTA_FORM })
      await loadDetalle(tratId)
      loadData()
    } finally {
      setAddingNota(false)
    }
  }

  const filtered = tratamientos.filter(t => {
    if (filterActivo === 'activo') return t.activo
    if (filterActivo === 'finalizado') return !t.activo
    return true
  })

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Control de Ortodoncia</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Gestión de tratamientos y seguimiento evolutivo</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowNewTrat(true); setTratErrors({}); setApiError('') }}>
          <Plus size={16} />
          Nuevo Tratamiento
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'activo', label: 'Activos' },
          { key: 'finalizado', label: 'Finalizados' },
          { key: 'todos', label: 'Todos' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${filterActivo === tab.key ? ' active' : ''}`}
            onClick={() => setFilterActivo(tab.key as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Treatment cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Cargando tratamientos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Braces size={44} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>Sin tratamientos {filterActivo !== 'todos' ? filterActivo + 's' : ''}</div>
            <div style={{ fontSize: 13 }}>Registre el primer tratamiento de ortodoncia</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(trat => {
            const pagado = parseFloat(trat.costoTotal) - parseFloat(trat.saldoPendiente)
            const pct = parseFloat(trat.costoTotal) > 0
              ? Math.round((pagado / parseFloat(trat.costoTotal)) * 100)
              : 0
            const isExpanded = expandedId === trat.id

            return (
              <div key={trat.id} className="card" style={{ overflow: 'hidden' }}>
                {/* Card header */}
                <div
                  style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 16 }}
                  onClick={() => toggleExpand(trat.id)}
                >
                  <div className="initials-circle" style={{ marginTop: 2 }}>
                    {trat.pacienteNombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                        {trat.pacienteNombre}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI: {trat.pacienteDni}</span>
                      <span className={`badge ${trat.activo ? 'badge-completada' : 'badge-cancelada'}`} style={{ fontSize: 11 }}>
                        {trat.activo ? 'Activo' : 'Finalizado'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px 20px', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Costo Total</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>S/ {parseFloat(trat.costoTotal).toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Cuotas Pactadas</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{trat.cuotasPactadas}</div>
                      </div>
                        <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Saldo Pendiente</div>
                        <div style={{ fontWeight: 700, color: parseFloat(trat.saldoPendiente) > 0 ? '#f59e0b' : '#1A4B8C', fontSize: 15 }}>
                          S/ {parseFloat(trat.saldoPendiente).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Arco Actual</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>
                          {trat.tipoArcoActual || '—'}
                        </div>
                      </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progreso de pago</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? '#1A4B8C' : 'var(--text-secondary)' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded: notes */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                      Notas de Evolución
                    </h3>

                    {/* Add nota form */}
                    <div className="card" style={{ padding: 16, marginBottom: 16, background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                          <label>Nueva Nota de Evolución</label>
                          <textarea
                            className="input-field"
                            value={notaForm.nota}
                            onChange={e => setNotaForm(f => ({ ...f, nota: e.target.value }))}
                            placeholder="Descripción de la sesión, estado del tratamiento..."
                            rows={2}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Tipo de Arco Usado</label>
                          <input className="input-field" value={notaForm.arcoUsado} onChange={e => setNotaForm(f => ({ ...f, arcoUsado: e.target.value }))} placeholder="Ej: Arco 7B, NiTi 0.14" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Monto Pagado en esta Sesión (S/)</label>
                          <input className="input-field" type="number" min="0" step="0.01" value={notaForm.montoPagado} onChange={e => setNotaForm(f => ({ ...f, montoPagado: e.target.value }))} placeholder="0.00" />
                        </div>
                      </div>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleAddNota(trat.id)}
                        disabled={addingNota || !notaForm.nota.trim()}
                      >
                        <PlusCircle size={14} />
                        {addingNota ? 'Guardando...' : 'Agregar Nota'}
                      </button>
                    </div>

                    {/* Notes list */}
                    {loadingDetalle ? (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                        <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                      </div>
                    ) : !detalle?.notas?.length ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>
                        Sin notas de evolución registradas
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {detalle.notas.map((nota, idx) => (
                          <div key={nota.id} style={{
                            padding: '14px 16px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                            position: 'relative',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                                {new Date(nota.creadoEn).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {' · '}
                                {new Date(nota.creadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sesión #{detalle.notas.length - idx}</span>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: nota.arcoUsado || nota.montoPagado ? 10 : 0, lineHeight: 1.6 }}>
                              {nota.nota}
                            </p>
                            <div style={{ display: 'flex', gap: 16 }}>
                              {nota.arcoUsado && (
                                <div style={{ fontSize: 12 }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Arco: </span>
                                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{nota.arcoUsado}</span>
                                </div>
                              )}
                              {nota.montoPagado && parseFloat(nota.montoPagado) > 0 && (
                                <div style={{ fontSize: 12 }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Pago: </span>
                                  <span style={{ color: '#1A4B8C', fontWeight: 600 }}>S/ {parseFloat(nota.montoPagado).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Nuevo Tratamiento */}
      {showNewTrat && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewTrat(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo Tratamiento de Ortodoncia</h2>
              <button onClick={() => setShowNewTrat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleNewTrat}>
              <div className="modal-body">
                {apiError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
                    <AlertCircle size={14} /> {apiError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Paciente *</label>
                    <select className="input-field" value={tratForm.pacienteId} onChange={e => setTratForm(f => ({ ...f, pacienteId: e.target.value }))}>
                      <option value="">Seleccionar paciente...</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                    </select>
                    {tratErrors.pacienteId && <span style={{ fontSize: 12, color: '#f87171' }}>{tratErrors.pacienteId}</span>}
                  </div>
                  <div className="form-group">
                    <label>Costo Total del Tratamiento (S/) *</label>
                    <input className="input-field" type="number" min="0" step="0.01" value={tratForm.costoTotal} onChange={e => setTratForm(f => ({ ...f, costoTotal: e.target.value }))} placeholder="0.00" />
                    {tratErrors.costoTotal && <span style={{ fontSize: 12, color: '#f87171' }}>{tratErrors.costoTotal}</span>}
                  </div>
                  <div className="form-group">
                    <label>Cuotas Pactadas *</label>
                    <input className="input-field" type="number" min="1" value={tratForm.cuotasPactadas} onChange={e => setTratForm(f => ({ ...f, cuotasPactadas: e.target.value }))} placeholder="12" />
                    {tratErrors.cuotasPactadas && <span style={{ fontSize: 12, color: '#f87171' }}>{tratErrors.cuotasPactadas}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Tipo de Arco Inicial</label>
                    <input className="input-field" value={tratForm.tipoArcoActual} onChange={e => setTratForm(f => ({ ...f, tipoArcoActual: e.target.value }))} placeholder="Ej: Arco 7B, NiTi 0.14..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewTrat(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={15} />
                  {submitting ? 'Guardando...' : 'Registrar Tratamiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
