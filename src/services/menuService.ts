import type { Menu, MenuItem } from '../models'
import { db } from './db'
import { generateId } from '../utils/id'
import { nowIso } from '../utils/time'

export async function listMenus(): Promise<Menu[]> {
  return db.menus.filter((item) => !item.deletedAt).toArray()
}

export async function getMenu(id: string): Promise<Menu | undefined> {
  return db.menus.get(id)
}

export async function createMenu(input: { name: string; items?: MenuItem[] }): Promise<Menu> {
  const now = nowIso()
  const menu: Menu = {
    id: generateId(),
    name: input.name.trim(),
    items: input.items ?? [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  await db.menus.add(menu)
  return menu
}

export async function updateMenu(id: string, updates: Partial<Menu>): Promise<Menu> {
  const menu = await db.menus.get(id)
  if (!menu) {
    throw new Error('菜单不存在')
  }
  const updated: Menu = {
    ...menu,
    ...updates,
    name: updates.name ? updates.name.trim() : menu.name,
    updatedAt: nowIso()
  }
  await db.menus.put(updated)
  return updated
}

export async function deleteMenu(id: string): Promise<void> {
  const menu = await db.menus.get(id)
  if (!menu) {
    return
  }
  await db.menus.put({
    ...menu,
    deletedAt: nowIso(),
    updatedAt: nowIso()
  })
}
