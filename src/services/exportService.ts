import { db } from './db'
import type { Category, Dish, Menu } from '../models'

export interface ExportPayload {
  version: string
  exportedAt: string
  categories: Category[]
  dishes: Dish[]
  menus: Menu[]
}

export async function exportJson(): Promise<ExportPayload> {
  const [categories, dishes, menus] = await Promise.all([
    db.categories.filter((item) => !item.deletedAt).toArray(),
    db.dishes.filter((item) => !item.deletedAt).toArray(),
    db.menus.filter((item) => !item.deletedAt).toArray()
  ])

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    categories,
    dishes,
    menus
  }
}

export async function downloadJson(filename = 'menu_app_export.json'): Promise<void> {
  const payload = await exportJson()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
