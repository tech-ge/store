'use client'
import { useCart } from '@/hooks/useCart'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQty, remove, subtotal } = useCart()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lift p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-navy">Your cart</h2>
          <button onClick={onClose} className="text-text-muted">Close</button>
        </div>
        {items.length === 0 && <p className="text-sm text-text-muted">Cart is empty.</p>}
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.productId} className="flex gap-3">
              <img src={i.image} alt={i.title} className="w-16 h-16 rounded-lg object-cover bg-surface-muted" />
              <div className="flex-1">
                <div className="text-sm text-navy line-clamp-2">{i.title}</div>
                <div className="text-brand text-sm font-semibold mt-1">${i.price.toFixed(2)}</div>
                <input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) => updateQty(i.productId, Number(e.target.value))}
                  className="w-14 mt-1 px-2 py-1 rounded border border-surface-border text-sm"
                />
                <button onClick={() => remove(i.productId)} className="text-xs text-red-600 ml-2">Remove</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="mt-6 border-t border-surface-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-semibold text-navy">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
