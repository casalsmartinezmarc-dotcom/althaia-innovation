import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useApp } from '../../context/AppContext'
import { AlertTriangle, X } from 'lucide-react'

export default function Layout({ children, title, subtitle }) {
  const { dbWriteError, clearDbWriteError } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop mòbil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="sm:ml-60 flex flex-col min-h-screen">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen(v => !v)}
        />
        {dbWriteError && (
          <div className="mx-4 sm:mx-6 mt-3 bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error guardant a Supabase</p>
              <p className="text-xs text-red-700 mt-0.5 font-mono">{dbWriteError}</p>
            </div>
            <button onClick={clearDbWriteError} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
