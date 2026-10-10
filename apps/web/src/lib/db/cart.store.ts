import { idbGetAll, idbPut, idbDelete, idbClear } from './indexeddb'

export interface CartItem {
  id: string
  productId: string
  title: string
  image: string
  price: number
  currency: string
  qty: number
  storeId: string
  sellerId?: string
  addedAt: number
  priceAtAdd: number
}

export const CartStore = {
  all: () => idbGetAll<CartItem>('cart'),

  async add(item: Omit<CartItem, 'addedAt' | 'priceAtAdd'>) {
    const existing = (await idbGetAll<CartItem>('cart'))
      .find(i => i.productId === item.productId)
    if (existing) {
      await idbPut<CartItem>('cart', { ...existing, qty: existing.qty + item.qty })
    } else {
      await idbPut<CartItem>('cart', {
        ...item,
        addedAt: Date.now(),
        priceAtAdd: item.price
      })
    }
  },

  async updateQty(productId: string, qty: number) {
    const items = await idbGetAll<CartItem>('cart')
    const item = items.find(i => i.productId === productId)
    if (!item) return
    if (qty <= 0) return idbDelete('cart', productId)
    await idbPut<CartItem>('cart', { ...item, qty })
  },

  remove: (productId: string) => idbDelete('cart', productId),
  clear: () => idbClear('cart')
}
