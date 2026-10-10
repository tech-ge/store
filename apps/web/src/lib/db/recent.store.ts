import { idbGetAll, idbPut, idbClear } from './indexeddb'

export interface RecentSearch { id: string; term: string; at: number }

export const RecentStore = {
  all: () => idbGetAll<RecentSearch>('recentSearches'),
  async push(term: string) {
    const t = term.trim().toLowerCase()
    if (!t) return
    await idbPut<RecentSearch>('recentSearches', { id: t, term: t, at: Date.now() })
  },
  clear: () => idbClear('recentSearches')
}
