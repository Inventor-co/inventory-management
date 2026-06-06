import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-500 text-white font-display font-700 px-5 py-2.5 rounded-xl hover:bg-red-600 transition-all duration-200 active:scale-95 text-sm disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}
