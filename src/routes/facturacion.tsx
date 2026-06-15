import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from '../lib/AuthContext.js'
import { AppLayout } from '../components/AppLayout.js'
import {
  Receipt, Plus, X, Save, Printer, DollarSign,
  TrendingUp, AlertCircle, CheckCircle2, BarChart2,
  FileText, ChevronDown,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export const Route = createFileRoute('/facturacion')({
  component: () => (
    <AuthProvider>
      <FacturacionGuard />
    </AuthProvider>
  ),
})

function FacturacionGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' })
    if (!loading && user && user.rol !== 'administrador') navigate({ to: '/dashboard' })
  }, [user, loading])
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
  if (!user) return null
  return <AppLayout><Facturacion /></AppLayout>
}

interface Pago {
  id: number
  concepto: string
  monto: string
  estado: string
  tipoProcedimiento: string | null
  fechaPago: string | null
  creadoEn: string
  pacienteId: number
  pacienteNombre: string
}

interface ReporteData {
  rows: Pago[]
  stats: Array<{ mes: string; total: string; conteo: number }>
  frecuentes: Array<{ concepto: string; conteo: number; total: string }>
}

interface Paciente { id: number; nombreCompleto: string }

const PROCEDIMIENTOS = [
  'Consulta General', 'Limpieza Dental', 'Extracción Simple', 'Extracción Molar',
  'Radiografía', 'Endodoncia', 'Blanqueamiento', 'Resina Dental', 'Cuota Ortodoncia',
  'Bracket Instalación', 'Control de Ortodoncia', 'Otro',
]

const EMPTY_FORM = { pacienteId: '', concepto: '', monto: '', tipoProcedimiento: '' }

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function Facturacion() {
  const [tab, setTab] = useState<'pagos' | 'reportes'>('pagos')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [printPago, setPrintPago] = useState<Pago | null>(null)
  const [markingPaid, setMarkingPaid] = useState<number | null>(null)
  const { user } = useAuth()

  async function loadData() {
    setLoading(true)
    try {
      const [pagosRes, reporteRes, pacRes] = await Promise.all([
        fetch('/api/pagos/'),
        fetch('/api/pagos/?tipo=reporte'),
        fetch('/api/pacientes/'),
      ])
      if (pagosRes.ok) setPagos(await pagosRes.json())
      if (reporteRes.ok) setReporte(await reporteRes.json())
      if (pacRes.ok) setPacientes(await pacRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.pacienteId) e.pacienteId = 'Seleccione un paciente'
    if (!form.concepto.trim()) e.concepto = 'El concepto es requerido'
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) e.monto = 'Ingrese un monto válido'
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
      const res = await fetch('/api/pagos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      })
      if (!res.ok) {
        const d = await res.json()
        setApiError(d.error || 'Error al guardar')
        return
      }
      setShowModal(false)
      setForm({ ...EMPTY_FORM })
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function marcarPagado(pagoId: number) {
    setMarkingPaid(pagoId)
    await fetch(`/api/pagos/${pagoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pagado' }),
    })
    setMarkingPaid(null)
    loadData()
  }

  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((acc, p) => acc + parseFloat(p.monto), 0)
  const totalCobrado = pagos.filter(p => p.estado === 'pagado').reduce((acc, p) => acc + parseFloat(p.monto), 0)

  // Chart data for monthly income
  const monthlyData = (() => {
    const byMonth: Record<string, number> = {}
    pagos.filter(p => p.estado === 'pagado' && p.fechaPago).forEach(p => {
      const m = p.fechaPago!.slice(0, 7) // YYYY-MM
      byMonth[m] = (byMonth[m] || 0) + parseFloat(p.monto)
    })
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    return {
      labels: sorted.map(([k]) => {
        const [y, m] = k.split('-')
        return `${MESES_ES[parseInt(m) - 1]} ${y.slice(2)}`
      }),
      datasets: [{
        label: 'Ingresos (S/)',
        data: sorted.map(([, v]) => v),
        backgroundColor: 'rgba(26,75,140,0.7)',
        borderRadius: 6,
        borderColor: 'rgba(26,75,140,0.9)',
        borderWidth: 1,
      }],
    }
  })()

  const frecuentesData = reporte?.frecuentes?.slice(0, 5)
  const donutData = frecuentesData ? {
    labels: frecuentesData.map(f => f.concepto),
    datasets: [{
      data: frecuentesData.map(f => f.conteo),
      backgroundColor: [
        'rgba(26,75,140,0.8)',
        'rgba(59,130,246,0.8)',
        'rgba(245,158,11,0.8)',
        'rgba(26,75,140,0.8)',
        'rgba(139,92,246,0.8)',
      ],
      borderWidth: 0,
    }],
  } : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` S/ ${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#7a9bbf' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#7a9bbf' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Facturación y Reportes</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Control de pagos, comprobantes e informes</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setErrors({}); setApiError('') }}>
          <Plus size={16} />
          Registrar Pago
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <DollarSign size={17} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Pendiente</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>
            S/ {totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {pagos.filter(p => p.estado === 'pendiente').length} cobro(s) pendiente(s)
          </div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(26,75,140,0.12)', border: '1px solid rgba(26,75,140,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A4B8C' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Cobrado</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A4B8C' }}>
            S/ {totalCobrado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {pagos.filter(p => p.estado === 'pagado').length} pago(s) completado(s)
          </div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(26,75,140,0.12)', border: '1px solid rgba(26,75,140,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <TrendingUp size={17} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Facturado</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            S/ {(totalPendiente + totalCobrado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {pagos.length} registro(s) total
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`tab-btn${tab === 'pagos' ? ' active' : ''}`} onClick={() => setTab('pagos')}>
          <Receipt size={14} style={{ display: 'inline', marginRight: 6 }} />
          Registro de Pagos
        </button>
        <button className={`tab-btn${tab === 'reportes' ? ' active' : ''}`} onClick={() => setTab('reportes')}>
          <BarChart2 size={14} style={{ display: 'inline', marginRight: 6 }} />
          Reportes
        </button>
      </div>

      {tab === 'pagos' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-container">
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : pagos.length === 0 ? (
              <div className="empty-state">
                <Receipt size={44} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>Sin registros de pago</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(pago => (
                    <tr key={pago.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pago.pacienteNombre}</td>
                      <td>{pago.concepto}</td>
                      <td style={{ fontWeight: 700, color: pago.estado === 'pagado' ? '#1A4B8C' : '#f59e0b' }}>
                        S/ {parseFloat(pago.monto).toFixed(2)}
                      </td>
                      <td><span className={`badge badge-${pago.estado}`}>{pago.estado === 'pagado' ? 'Pagado' : 'Pendiente'}</span></td>
                      <td style={{ fontSize: 13 }}>
                        {pago.fechaPago
                          ? new Date(pago.fechaPago + 'T00:00:00').toLocaleDateString('es-PE')
                          : new Date(pago.creadoEn).toLocaleDateString('es-PE')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {pago.estado === 'pendiente' && (
                            <button className="btn-success btn-sm" onClick={() => marcarPagado(pago.id)} disabled={markingPaid === pago.id}>
                              <CheckCircle2 size={13} />
                              {markingPaid === pago.id ? '...' : 'Cobrar'}
                            </button>
                          )}
                          <button className="btn-secondary btn-sm" onClick={() => setPrintPago(pago)}>
                            <Printer size={13} /> Comprobante
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'reportes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 20 }}>
          {/* Bar chart */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Ingresos Mensuales (últimos 6 meses)</h3>
            {monthlyData.labels.length === 0 ? (
              <div className="empty-state"><BarChart2 size={36} /><div>Sin datos de ingresos aún</div></div>
            ) : (
              <Bar data={monthlyData} options={chartOptions as any} />
            )}
          </div>

          {/* Donut chart */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Tratamientos Más Frecuentes</h3>
            {donutData && frecuentesData && frecuentesData.length > 0 ? (
              <>
                <div style={{ maxWidth: 220, margin: '0 auto 16px' }}>
                  <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {frecuentesData.map((f, i) => (
                    <div key={f.concepto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: donutData.datasets[0].backgroundColor[i] as string, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.concepto}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.conteo}x</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state"><BarChart2 size={36} /><div>Sin datos suficientes</div></div>
            )}
          </div>

          {/* Summary table */}
          {reporte?.frecuentes && reporte.frecuentes.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', gridColumn: '1 / -1' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Resumen por Procedimiento</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Procedimiento</th>
                      <th>Cantidad</th>
                      <th>Total Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.frecuentes.map(f => (
                      <tr key={f.concepto}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.concepto}</td>
                        <td>{f.conteo}</td>
                        <td style={{ fontWeight: 700, color: '#1A4B8C' }}>S/ {parseFloat(f.total || '0').toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New payment modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Registrar Pago</h2>
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
                    <label>Concepto / Procedimiento *</label>
                    <select className="input-field" value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}>
                      <option value="">Seleccionar...</option>
                      {PROCEDIMIENTOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.concepto && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.concepto}</span>}
                  </div>
                  <div className="form-group">
                    <label>Monto (S/) *</label>
                    <input className="input-field" type="number" min="0" step="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="0.00" />
                    {errors.monto && <span style={{ fontSize: 12, color: '#f87171' }}>{errors.monto}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Tipo de Procedimiento</label>
                    <select className="input-field" value={form.tipoProcedimiento} onChange={e => setForm(f => ({ ...f, tipoProcedimiento: e.target.value }))}>
                      <option value="">Seleccionar tipo...</option>
                      <option value="fijo_ortodoncia">Cuota Fija - Ortodoncia</option>
                      <option value="procedimiento_variable">Procedimiento Variable</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={15} />
                  {submitting ? 'Guardando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print / Comprobante modal */}
      {printPago && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Comprobante de Pago</h2>
              <button onClick={() => setPrintPago(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Receipt design */}
              <div id="receipt" style={{
                background: 'var(--bg-secondary)', borderRadius: 12, padding: 24,
                border: '1px solid var(--border)',
              }}>
                <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px dashed var(--border-light)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1 }}>CLÍNICA DENTAL AZULA2</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Sistema Azula Dent</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>COMPROBANTE DE PAGO</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>N° {String(printPago.id).padStart(6, '0')}</div>
                </div>
                {[
                  { label: 'Paciente', value: printPago.pacienteNombre },
                  { label: 'Concepto', value: printPago.concepto },
                  { label: 'Fecha', value: printPago.fechaPago ? new Date(printPago.fechaPago + 'T00:00:00').toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(printPago.creadoEn).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Estado', value: printPago.estado === 'pagado' ? 'PAGADO' : 'PENDIENTE' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: 18, fontWeight: 800 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>TOTAL:</span>
                  <span style={{ color: 'var(--accent)' }}>S/ {parseFloat(printPago.monto).toFixed(2)}</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border-light)', fontSize: 12, color: 'var(--text-muted)' }}>
                  Gracias por su confianza — Clínica Dental Azula2
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setPrintPago(null)}>Cerrar</button>
              <button className="btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
