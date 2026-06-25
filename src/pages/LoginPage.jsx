import { useState } from 'react'
import { Activity, Eye, EyeOff, Lock, Mail } from 'lucide-react'

// Credencials de l'únic compte admin
const ADMIN = {
  email:    'admin@althaia.cat',
  password: 'althaia2024',
}

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (email.trim() === ADMIN.email && password === ADMIN.password) {
        onLogin()
      } else {
        setError('Correu electrònic o contrasenya incorrectes.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-althaia-950 via-althaia-800 to-teal-700 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in">

        {/* Header */}
        <div className="bg-althaia-600 px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Althaia Innovació</h1>
          <p className="text-althaia-200 text-sm mt-1">Centre de Comandament</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div>
            <label className="label">Correu electrònic</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="input pl-9"
                placeholder="admin@althaia.cat"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Contrasenya</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                className="input pl-9 pr-10"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-base"
          >
            {loading ? 'Iniciant sessió...' : 'Iniciar sessió'}
          </button>

          {/* Hint */}
          <p className="text-center text-xs text-gray-400 pt-1">
            Compte únic · Contacta l'administrador si no tens accés
          </p>
        </form>
      </div>
    </div>
  )
}
