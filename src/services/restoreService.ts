import { db } from './db'
import { nowIso } from '../utils/time'

export async function restoreCategory(id: string): Promise<void> {
  const category = await db.categories.get(id)
  if (!category) return
  await db.categories.put({
    ...category,
    deletedAt: null,
    updatedAt: nowIso()
  })
}

export async function restoreDish(id: string): Promise<void> {
  const dish = await db.dishes.get(id)
  if (!dish) return
  await db.dishes.put({
    ...dish,
    deletedAt: null,
    updatedAt: nowIso()
  })
}

export async function restoreMenu(id: string): Promise<void> {
  const menu = await db.menus.get(id)
  if (!menu) return
  await db.menus.put({
    ...menu,
    deletedAt: null,
    updatedAt: nowIso()
  })
}
