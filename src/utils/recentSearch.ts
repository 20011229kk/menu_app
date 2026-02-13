const KEY = 'menu_app_recent_searches'
const MAX_ITEMS = 6

export function getRecentSearches(): string[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentSearch(keyword: string): string[] {
  const normalized = keyword.trim()
  if (!normalized) return getRecentSearches()
  const current = getRecentSearches().filter((item) => item !== normalized)
  const next = [normalized, ...current].slice(0, MAX_ITEMS)
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearRecentSearches(): void {
  localStorage.removeItem(KEY)
}
