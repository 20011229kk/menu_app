export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const now = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${now}${rand}`
}
