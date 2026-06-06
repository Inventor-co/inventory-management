import { useEffect, useState } from 'react'
import { ordersApi, customersApi, productsApi } from '../api'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { ShoppingCart, Plus, Trash2, Eye, PlusCircle, MinusCircle } from 'lucide-react'

function CreateOrderModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    Promise.all([customersApi.getAll(), productsApi.getAll()])
      .then(([c, p]) => { setCustomers(c.data); setProducts(p.data) })
      .catch(() => toast.error('Failed to load data'))
  }, [isOpen])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, key, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: val } : item))

  const selectedProducts = items.map(i => products.find(p => p.id === parseInt(i.product_id)))

  const total = items.reduce((sum, item, idx) => {
    const p = selectedProducts[idx]
    return sum + (p ? p.price * item.quantity : 0)
  }, 0)

  const handleSubmit = async () => {
    if (!customerId) return toast.error('Please select a customer')
    if (items.some(i => !i.product_id)) return toast.error('Please select a product for each item')
    setSaving(true)
    try {
      await ordersApi.create({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      })
      toast.success('Order placed successfully!')
      onCreated()
      onClose()
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Order" size="lg">
      <div className="space-y-5">
        <div>
          <label className="label">Customer *</label>
          <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Order Items *</label>
            <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-volt-400 hover:text-volt-500 font-display font-600 transition-colors">
              <PlusCircle size={14} /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const prod = selectedProducts[idx]
              return (
                <div key={idx} className="flex gap-3 items-start p-4 bg-ink-900 rounded-xl border border-ink-700">
                  <div className="flex-1">
                    <select
                      className="input mb-2"
                      value={item.product_id}
                      onChange={e => updateItem(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                          {p.name} — ${p.price.toFixed(2)} ({p.quantity_in_stock} in stock)
                        </option>
                      ))}
                    </select>
                    {prod && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))} className="text-slate-400 hover:text-volt-400 transition-colors">
                            <MinusCircle size={18} />
                          </button>
                          <span className="font-mono text-white w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateItem(idx, 'quantity', Math.min(prod.quantity_in_stock, item.quantity + 1))} className="text-slate-400 hover:text-volt-400 transition-colors">
                            <PlusCircle size={18} />
                          </button>
                        </div>
                        <span className="font-mono text-volt-400 text-sm">${(prod.price * item.quantity).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors mt-1">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-volt-400/5 border border-volt-400/20 rounded-xl">
            <span className="font-display font-600 text-slate-400">Total Amount</span>
            <span className="font-display font-800 text-volt-400 text-xl">${total.toFixed(2)}</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full">
          {saving ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </Modal>
  )
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Order #${order.id}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-ink-900 rounded-xl border border-ink-700">
            <div className="text-xs text-slate-500 font-mono mb-1">Customer</div>
            <div className="font-display font-600 text-white">{order.customer?.full_name}</div>
            <div className="text-sm text-slate-400">{order.customer?.email}</div>
          </div>
          <div className="p-4 bg-ink-900 rounded-xl border border-ink-700">
            <div className="text-xs text-slate-500 font-mono mb-1">Order Date</div>
            <div className="font-display font-600 text-white">{new Date(order.created_at).toLocaleDateString()}</div>
            <div className="text-sm text-slate-400">{new Date(order.created_at).toLocaleTimeString()}</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-display font-600 text-slate-500 uppercase tracking-widest mb-3">Items</div>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-ink-900 rounded-xl border border-ink-700">
                <div>
                  <div className="font-display font-600 text-white text-sm">{item.product?.name || `Product #${item.product_id}`}</div>
                  <div className="text-xs text-slate-500 font-mono">${item.unit_price.toFixed(2)} × {item.quantity}</div>
                </div>
                <div className="font-mono text-volt-400">${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-volt-400/5 border border-volt-400/20 rounded-xl">
          <span className="font-display font-600 text-slate-400">Total</span>
          <span className="font-display font-800 text-volt-400 text-xl">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </Modal>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    ordersApi.getAll()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await ordersApi.delete(deleteTarget.id)
      toast.success('Order cancelled')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cancel failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 fade-up">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-widest mb-2">
            <ShoppingCart size={12} /> Orders
          </div>
          <h1 className="font-display font-800 text-3xl lg:text-4xl text-white">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="card fade-up fade-up-delay-1 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-ink-700/50 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Create your first order to get started"
            action={<button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={16} />New Order</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-ink-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-volt-400 bg-volt-400/5 px-2 py-1 rounded-lg text-sm">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-display font-600 text-white text-sm">{order.customer?.full_name || '—'}</div>
                      <div className="text-xs text-slate-500">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-600 text-white">${order.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={order.status === 'confirmed' ? 'badge-green' : 'badge-blue'}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewOrder(order)} className="p-2 rounded-lg text-slate-400 hover:text-volt-400 hover:bg-volt-400/10 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(order)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOrderModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
      <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Cancel Order"
        message={`Cancel order #${deleteTarget?.id}? Stock will be restored automatically.`}
      />
    </div>
  )
}
