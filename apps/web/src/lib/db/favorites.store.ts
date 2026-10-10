import { idbGetAll, idbPut, idbDelete } from './indexeddb'

export interface FavoriteItem {
  id: string
  productId: string
  title: string
  image: string
  price: number
  currency: string
  savedAt: number
}

export const FavoritesStore = {
  all: () => idbGetAll<FavoriteItem>('favorites'),

  async toggle(item: Omit<FavoriteItem, 'savedAt'>) {
    const items = await idbGetAll<FavoriteItem>('favorites')
    const exists = items.some(i => i.productId === item.productId)
    if (exists) {
      await idbDelete('favorites', item.id)
      return false
    }
    await idbPut<FavoriteItem>('favorites', { ...item, savedAt: Date.now() })
    return true
  }
}
