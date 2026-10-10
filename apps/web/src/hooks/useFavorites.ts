'use client'
import { useCallback, useEffect, useState } from 'react'
import { FavoritesStore, FavoriteItem } from '@/lib/db/favorites.store'

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([])

  const refresh = useCallback(async () => setItems(await FavoritesStore.all()), [])
  useEffect(() => { refresh() }, [refresh])

  const toggle = async (item: Parameters<typeof FavoritesStore.toggle>[0]) => {
    const nowFav = await FavoritesStore.toggle(item)
    await refresh()
    return nowFav
  }

  const isFavorite = (id: string) => items.some(i => i.productId === id)

  return { items, toggle, isFavorite, refresh }
}
