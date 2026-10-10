'use client'
import { useCallback, useEffect, useState } from 'react'
import { CartStore, CartItem } from '@/lib/db/cart.store'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setItems(await CartStore.all())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const add = async (item: Parameters<typeof CartStore.add>[0]) => {
    await CartStore.add(item)
    await refresh()
  }
  const updateQty = async (id: string, qty: number) => {
    await CartStore.updateQty(id, qty)
    await refresh()
  }
  const remove = async (id: string) => {
    await CartStore.remove(id)
    await refresh()
  }
  const clear = async () => { await CartStore.clear(); await refresh() }

  const count = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  return { items, loading, count, subtotal, add, updateQty, remove, clear, refresh }
}
