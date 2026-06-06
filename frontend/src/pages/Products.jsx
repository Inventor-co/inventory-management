import { useEffect, useState } from 'react'
import { productsApi } from '../api'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react'

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '', description: '' }

function ProductForm({ form, onChange, onSubmit, loading, mode }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Product Name *</label>
          <input className="input" placeholder="e.g. Wireless Mouse" value={form.name} onChange={e => onChange('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">SKU *</label>
          <input className="input font-mono" placeholder="e.g. WM-001" value={form.sku} onChange={e => onChange('sku', e.target.value)} required />
        </div>
        <div>
          <label className="label">Price ($) *</label>
          <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => onChange('price', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className="label">Quantity in Stock *</label>
          <input className="input" type="number" min="0" placeholder="0" value={form.quantity_in_stock} onChange={e => onChange('quantity_in_stock', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input resize-none h-20" placeholder="Optional description…" value={form.description} onChange={e => onChange('description', e.target.value)} />
        </div>
      </div>
      <button onClick={onSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Product'}
      </button>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    productsApi.getAll()
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity_in_stock: p.quantity_in_stock, description: p.description || '', _id: p.id })
    setModal('edit')
  }

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.name || !form.sku || form.price === '' || form.quantity_in_stock === '') {
      return toast.error('Please fill in all required fields')
    }
    setSaving(true)
    const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), quantity_in_stock: parseInt(form.quantity_in_stock), description: form.description || null }
    try {
      if (modal === 'edit') {
        await productsApi.update(form._id, payload)
        toast.success('Product updated')
      } else {
        await productsApi.create(payload)
        toast.success('Product added')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsApi.delete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const stockBadge = (qty) => {
    if (qty === 0) return <span className="badge-red">Out of stock</span>
    if (qty <= 5) return <span className="badge-yellow">{qty} left</span>
    return <span className="badge-green">{qty} in stock</span>
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 fade-up">
        <div>
          <div className="flex items-center gap-2 text-volt-400 text-xs font-mono uppercase tracking-widest mb-2">
            <Package size={12} /> Products
          </div>
          <h1 className="font-display font-800 text-3xl lg:text-4xl text-white">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 fade-up fade-up-delay-1">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-10"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card fade-up fade-up-delay-2 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-ink-700/50 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={search ? 'No results found' : 'No products yet'}
            description={search ? `No products match "${search}"` : 'Add your first product to get started'}
            action={!search && <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={16} />Add Product</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-display font-600 text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-ink-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-display font-600 text-white">{product.name}</div>
                      {product.description && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-48">{product.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-volt-400 bg-volt-400/5 px-2 py-1 rounded-lg">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-white">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">{stockBadge(product.quantity_in_stock)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-slate-400 hover:text-volt-400 hover:bg-volt-400/10 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(product)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
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

      {/* Add/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit Product' : 'Add Product'}>
        <ProductForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={saving} mode={modal} />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
