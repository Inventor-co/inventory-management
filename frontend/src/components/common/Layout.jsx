import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Users, ShoppingCart, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
]

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ink-900 border-r border-ink-700 flex flex-col
        transform transition-transform duration-300 lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-volt-400 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-ink-950" fill="currentColor" />
            </div>
            <div>
              <div className="font-display font-800 text-white text-lg leading-none">StockFlow</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">v1.0.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-600
                transition-all duration-200 group
                ${isActive
                  ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-ink-700'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-ink-700">
          <div className="text-xs text-slate-600 font-mono text-center">
            Inventory & Order Management
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-ink-900/90 backdrop-blur border-b border-ink-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-volt-400 rounded flex items-center justify-center">
              <Zap size={12} className="text-ink-950" fill="currentColor" />
            </div>
            <span className="font-display font-700 text-white">StockFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-ink-700 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
