export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-700 border border-ink-600 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-500" />
      </div>
      <h3 className="font-display font-700 text-white text-lg mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
