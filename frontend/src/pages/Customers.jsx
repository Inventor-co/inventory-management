import { useEffect, useState } from 'react'
import { customersApi } from '../api'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { Users, Plus, Trash2, Search, Mail, Phone } from 'lucide-react'

const EMPTY_FORM = { full_name: '', email: '', phone_number: '' }

function CustomerForm({ form, onChange, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input" placeholder="e.g. Jane Smith" value={form.full_name} onChange={e => onChange('full_name', e.target.value)} />
      </div>
      <div>
        <label className="label">Email Address *</label>
        <input className="input" type="email" placeholder="jane@example.com" value={form.email} onChange={e => onChange('email', e.target.value)} />
      </div>
      <div>
        <label className="label">Phone Number</label>
        <input className="input" placeholder="+1 (555) 000-0000" value={form.phone_number} onChange={e => onChange('phone_number', e.target.value)} />
      </div>
      <button onClick={onSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving…' : 'Add Customer'}
      </button>
    </div>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    customersApi.getAll()
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) return toast.error('Name and email are required')
    setSaving(true)
    try {
      await customersApi.create(form)
      toast.success('Customer added')
      setModalOpen(false)
      setForm(EMPTY_FORM)
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
      await customersApi.delete(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500']
  const colorFor = (id) => colors[id % colors.length]

  return (
    <div>
      <div className="flex items-start justify-between mb-8 fade-up">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-2">
            <Users size={12} /> Customers
          </div>
          <h1 className="font-display font-800 text-3xl lg:text-4xl text-white">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">{customers.length} customer{customers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative mb-6 fade-up fade-up-delay-1">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-10" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse bg-ink-700/50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card fade-up fade-up-delay-2">
          <EmptyState
            icon={Users}
            title={search ? 'No results found' : 'No customers yet'}
            description={search ? `No customers match "${search}"` : 'Add your first customer to get started'}
            action={!search && <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={16} />Add Customer</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-up fade-up-delay-2">
          {filtered.map(c => (
            <div key={c.id} className="card p-5 hover:border-ink-500 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorFor(c.id)} flex items-center justify-center font-display font-700 text-white text-sm`}>
                    {initials(c.full_name)}
                  </div>
                  <div>
                    <div className="font-display font-700 text-white">{c.full_name}</div>
                    <div className="text-xs text-slate-500 font-mono">#{c.id}</div>
                  </div>
                </div>
                <button onClick={() => setDeleteTarget(c)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={13} className="text-slate-600" />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone_number && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone size={13} className="text-slate-600" />
                    {c.phone_number}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-ink-700 text-xs text-slate-600 font-mono">
                Joined {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <CustomerForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? All associated orders will also be affected.`}
      />
    </div>
  )
}
