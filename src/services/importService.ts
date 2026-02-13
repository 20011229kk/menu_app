import type { ExportPayload } from './exportService'
import { db } from './db'

export interface ImportResult {
  categories: number
  dishes: number
  menus: number
}

function isExportPayload(input: unknown): input is ExportPayload {
  if (!input || typeof input !== 'object') return false
  const value = input as ExportPayload
  return Array.isArray(value.categories) && Array.isArray(value.dishes) && Array.isArray(value.menus)
}

export async function importJson(file: File): Promise<ImportResult> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  if (!isExportPayload(parsed)) {
    throw new Error('导入文件格式不正确')
  }

  await db.transaction('rw', db.categories, db.dishes, db.menus, async () => {
    await db.categories.clear()
    await db.dishes.clear()
    await db.menus.clear()
    await db.categories.bulkAdd(parsed.categories)
    await db.dishes.bulkAdd(parsed.dishes)
    await db.menus.bulkAdd(parsed.menus)
  })

  return {
    categories: parsed.categories.length,
    dishes: parsed.dishes.length,
    menus: parsed.menus.length
  }
}
