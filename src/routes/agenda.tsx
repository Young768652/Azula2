import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '../lib/AuthContext.js'
import { AppLayout } from '../components/AppLayout.js'
import {
  CalendarPlus, Calendar, Clock, ChevronLeft, ChevronRight,
  X, Save, Trash2, MessageCircle, AlertCircle, Edit2, Filter,
} from 'lucide-react'

export const Route = createFileRoute('/agenda')({
  component: () => (
    <AuthProvider>
      <AgendaGuard />
    </AuthProvider>
  ),
})

function AgendaGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
  }, [user, loading])
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
  if (!user) return null
  return <AppLayout><Agenda /></AppLayout>
}

interface Cita {
  id: number
  fecha: string
  hora: string
  especialidad: string
  estado: string
  notas: string | null
  pacienteId: number
  pacienteNombre: string
  pacienteCelular: string | null
}

interface Paciente { id: number; nombreCompleto: string; celular: string | null }

const ESPECIALIDADES = [
  { value: 'odontologia_general', label: 'Odontología General' },
  { value: 'ortodoncia', label: 'Ortodoncia' },
  { value: 'endodoncia', label: 'Endodoncia' },
]

const ESTADOS = [
  { value: 'programada', label: 'Programada' },
  { value: 'reprogramada', label: 'Reprogramada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'completada', label: 'Completada' },
]

const HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function Agenda() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [editCita, setEditCita] = useState<Cita | null>(null)
  const [form, setForm] = useState({ pacienteId: '', fecha: '', hora: '', especialidad: '', estado: 'programada', notas: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)

  async function loadCitas() {
    setLoading(true)
    try {
      const [citasRes, pacRes] = await Promise.all([
        fetch('/api/citas/'),
        fetch('/api/pacientes/'),
      ])
      if (citasRes.ok) setCitas(await citasRes.json())
      if (pacRes.ok) setPacientes(await pacRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCitas() }, [])

  function openNew(fecha = '') {
    setEditCita(null)
    setForm({ pacienteId: '', fecha, hora: '', especialidad: '', estado: 'programada', notas: '' })
    setErrors({})
    setApiError('')
    setShowModal(true)
  }

  function openEdit(c: Cita) {
    setEditCita(c)
    setForm({ pacienteId: String(c.pacienteId), fecha: c.fecha, hora: c.hora, especialidad: c.especialidad, estado: c.estado, notas: c.notas ?? '' })
    setErrors({})
    setApiError('')
    setShowModal(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.pacienteId) e.pacienteId = 'Seleccione un paciente'
    if (!form.fecha) e.fecha = 'La fecha es requerida'
    if (!form.hora) e.hora = 'La hora es requerida'
    if (!form.especialidad) e.especialidad = 'La especialidad es requerida'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)
    try {
      const url = editCita ? `/api/citas/${editCita.id}` : '/api/citas/'
      const method = editCita ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, notas: form.notas || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setApiError(d.error || 'Error al guardar')
        return
      }
      setShowModal(false)
      loadCitas()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/citas/${id}`, { method: 'DELETE' })
    loadCitas()
  }

  function enviarRecordatorio(cita: Cita) {
    const espLabel = ESPECIALIDADES.find(e => e.value === cita.especialidad)?.label ?? cita.especialidad
    const fechaFormat = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const msg = `Hola ${cita.pacienteNombre}, le recordamos su cita en Clínica Dental Azula2 para el *${fechaFormat}* a las *${cita.hora}* - Especialidad: *${espLabel}*. Por favor confirme su asistencia. ¡Gracias!`
    const phone = cita.pacienteCelular?.replace(/\D/g, '') ?? ''
    const url = phone
      ? `https://wa.me/51${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setWhatsappMsg(`Recordatorio enviado a ${cita.pacienteNombre}`)
    setTimeout(() => setWhatsappMsg(null), 3000)
  }

  // Calendar logic
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const citasByDay: Record<string, Cita[]> = {}
  citas.forEach(c => {
    if (!citasByDay[c.fecha]) citasByDay[c.fecha] = []
    citasByDay[c.fecha].push(c)
  })

  const citasDelDia = selectedDay
    ? (citasByDay[selectedDay] ?? []).filter(c => !filterEstado || c.estado === filterEstado)
    : []

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Agenda Interactiva</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{citas.length} cita{citas.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button className="btn-primary" onClick={() => openNew(selectedDay ?? '')}>
          <CalendarPlus size={16} />
          Nueva Cita
        </button>
      </div>

      {whatsappMsg && (
        <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(26,75,140,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={14} /> {whatsappMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 20 }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
              {MESES[month]} {year}
            </span>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const hasCitas = !!citasByDay[dateStr]?.length
              const isSelected = selectedDay === dateStr
              const isToday = dateStr === today

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(dateStr)}
                    style={{
                    width: '100%', aspectRatio: '1', borderRadius: 8,
                    background: isSelected ? 'var(--accent)' : isToday ? 'rgba(26,75,140,0.08)' : 'transparent',
                    color: isSelected ? 'var(--bg-primary)' : isToday ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 13, fontWeight: isSelected || isToday ? 700 : 400,
                    position: 'relative', transition: 'all 0.15s',
                    border: isSelected ? 'none' : isToday ? '1px solid rgba(26,75,140,0.3)' : '1px solid transparent',
                  }}
                >
                  {d}
                  {hasCitas && !isSelected && (
                    <span style={{
                      position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                      width: 4, height: 4, borderRadius: '50%', background: isToday ? 'var(--accent)' : 'var(--text-muted)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                {selectedDay
                  ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Seleccione un día'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {citasByDay[selectedDay ?? '']?.length ?? 0} cita(s) agendada(s)
              </div>
            </div>
            <select className="input-field" value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ width: 'auto', fontSize: 12, padding: '6px 10px' }}>
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <div style={{ maxHeight: 440, overflowY: 'auto' }}>
            {!selectedDay ? (
              <div className="empty-state"><Calendar size={36} /><div>Seleccione un día para ver las citas</div></div>
            ) : citasDelDia.length === 0 ? (
              <div className="empty-state">
                <Calendar size={36} />
                <div>No hay citas{filterEstado ? ` con estado "${ESTADOS.find(e => e.value === filterEstado)?.label}"` : ''} para este día</div>
                <button className="btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => openNew(selectedDay)}>
                  <CalendarPlus size={14} /> Agendar Cita
                </button>
              </div>
            ) : (
              citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora)).map(cita => (
                <div key={cita.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="initials-circle">{cita.pacienteNombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{cita.pacienteNombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {ESPECIALIDADES.find(e => e.value === cita.especialidad)?.label ?? cita.especialidad}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      <Clock size={13} /> {cita.hora}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${cita.estado}`}>{ESTADOS.find(e => e.value === cita.estado)?.label ?? cita.estado}</span>
                    {cita.notas && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cita.notas}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="btn-whatsapp btn-sm" onClick={() => enviarRecordatorio(cita)}>
                      <MessageCircle size={13} /> Enviar Recordatorio
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(cita)}>
                      <Edit2 size={13} /> Editar
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(cita.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                {editCita ? 'Editar Cita' : 'Nueva Cita'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {apiError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
                    <AlertCircle size={14} /> {apiError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Paciente *</label>
                    <select className="input-field" value={form.pacienteId} onChange={e => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
                      <option value="">Seleccionar paciente...</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                    </select>
                    {errors.pacienteId && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.pacienteId}</span>}
                  </div>
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input className="input-field" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                    {errors.fecha && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.fecha}</span>}
                  </div>
                  <div className="form-group">
                    <label>Hora *</label>
                    <select className="input-field" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}>
                      <option value="">Seleccionar hora...</option>
                      {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {errors.hora && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.hora}</span>}
                  </div>
                  <div className="form-group">
                    <label>Especialidad *</label>
                    <select className="input-field" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}>
                      <option value="">Seleccionar especialidad...</option>
                      {ESPECIALIDADES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                    {errors.especialidad && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.especialidad}</span>}
                  </div>
                  {editCita && (
                    <div className="form-group">
                      <label>Estado</label>
                      <select className="input-field" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Notas (opcional)</label>
                    <textarea className="input-field" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones, preparación especial..." rows={2} style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={15} />
                  {submitting ? 'Guardando...' : editCita ? 'Guardar Cambios' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
