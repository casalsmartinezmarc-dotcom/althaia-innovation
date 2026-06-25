import { useState } from 'react'
import { Activity, Eye, EyeOff, Lock, Mail, User, Briefcase, ArrowLeft } from 'lucide-react'
import { login, register } from '../data/auth'
import { SERVICES } from '../data/constants'
import clsx from 'clsx'

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [service, setService]   = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const reset = (m) => {
    setMode(m); setError('')
    setEmail(''); setPassword(''); setName(''); setService(''); setConfirm('')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    setTimeout(() => {
      const result = login(email, password)
      if (result.ok) onLogin(result.user)
      else setError(result.error)
      setLoading(false)
    }, 500)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les contrasenyes no coincideixen.'); return }
    if (password.length < 6)  { setError('La contrasenya ha de tenir mínim 6 caràcters.'); return }
    setLoading(true)
    setTimeout(() => {
      const result = register({ name, email, password, service })
      if (result.ok) onLogin(result.user)
      else setError(result.error)
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-althaia-950 via-althaia-800 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in">

        {/* Header */}
        <div className="bg-althaia-600 px-8 py-7 text-center">
          <div className="w-13 h-13 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 w-12 h-12">
            <Activity size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Althaia Innovació</h1>
          <p className="text-althaia-200 text-sm mt-0.5">Centre de Comandament</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => reset(m)}
              className={clsx(
                'flex-1 py-3 text-sm font-medium transition-colors',
                mode === m
                  ? 'text-althaia-600 border-b-2 border-althaia-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {m === 'login' ? 'Iniciar sessió' : 'Crear compte'}
            </button>
          ))}
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="px-7 py-6 space-y-4">
            <div>
              <label className="label">Correu electrònic</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pl-9" placeholder="correu@althaia.cat"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
              </div>
            </div>
            <div>
              <label className="label">Contrasenya</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Entrant...' : 'Iniciar sessió'}
            </button>
            <p className="text-center text-xs text-gray-400">
              No tens compte?{' '}
              <button type="button" onClick={() => reset('register')} className="text-althaia-600 font-medium hover:underline">
                Crea'n un
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTRE ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="px-7 py-6 space-y-4">
            <div>
              <label className="label">Nom complet *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="Dr. Joan Garcia"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Servei / Departament *</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select className="input pl-9" value={service} onChange={e => setService(e.target.value)} required>
                  <option value="">Selecciona el teu servei...</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Correu electrònic *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pl-9" placeholder="correu@althaia.cat"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Contrasenya *</label>
                <input type="password" className="input" placeholder="mínim 6 car."
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="label">Confirmar *</label>
                <input type="password" className="input" placeholder="repetir"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Creant compte...' : 'Crear compte professional'}
            </button>
            <p className="text-center text-xs text-gray-400">
              El compte es crearà com a <strong>professional</strong>.
              L'administrador pot canviar el rol posteriorment.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
