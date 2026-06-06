import { useEffect, useState } from 'react'
import { ordersApi } from '../api'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ label, value, icon: Icon, color, delay, link }) {
  return (
    <Link to={link} className={`card p-6 flex items-start justify-between hover:border-ink-500 transition-all duration-300 group fade-up ${delay}`}>
      <div>
        <div className="text-xs font-display font-600 text-slate-500 uppercase tracking-widest mb-2">{label}</div>
        <div className="font-display font-800 text-4xl text-white">{value ?? '—'}</div>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} />
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ordersApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Could not load stats. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="font-display font-700 text-white text-xl mb-2">Connection Error</h2>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-2 text-volt-400 text-xs font-mono uppercase tracking-widest mb-2">
          <TrendingUp size={12} />
          Overview
        </div>
        <h1 className="font-display font-800 text-3xl lg:text-4xl text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time summary of your inventory system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={loading ? null : stats?.total_products}
          icon={Package}
          color="bg-volt-400/10 text-volt-400"
          delay="fade-up-delay-1"
          link="/products"
        />
        <StatCard
          label="Total Customers"
          value={loading ? null : stats?.total_customers}
          icon={Users}
          color="bg-blue-400/10 text-blue-400"
          delay="fade-up-delay-2"
          link="/customers"
        />
        <StatCard
          label="Total Orders"
          value={loading ? null : stats?.total_orders}
          icon={ShoppingCart}
          color="bg-purple-400/10 text-purple-400"
          delay="fade-up-delay-3"
          link="/orders"
        />
      </div>

      {/* Low Stock */}
      <div className="card fade-up fade-up-delay-4">
        <div className="p-6 border-b border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-700 text-white">Low Stock Alert</h2>
              <p className="text-xs text-slate-500">Products with 5 or fewer units remaining</p>
            </div>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-xs text-volt-400 hover:text-volt-500 font-display font-600 transition-colors">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-ink-700/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats?.low_stock_products?.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-slate-500 text-sm">All products are well-stocked</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.low_stock_products?.map(product => (
                <div key={product.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-900 border border-ink-700 hover:border-amber-500/30 transition-colors">
                  <div>
                    <div className="font-display font-600 text-white text-sm">{product.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className={`badge-${product.quantity_in_stock === 0 ? 'red' : 'yellow'}`}>
                      {product.quantity_in_stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
