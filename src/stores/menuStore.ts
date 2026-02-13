import { create } from 'zustand'
import type { Menu, MenuItem } from '../models'
import { createMenu, deleteMenu, getMenu, listMenus, updateMenu } from '../services/menuService'
import { restoreMenu } from '../services/restoreService'
import { sortMenus } from '../utils/sort'

interface MenuState {
  menus: Menu[]
  loading: boolean
  lastDeleted?: Menu
  load: () => Promise<void>
  getById: (id: string) => Promise<Menu | undefined>
  add: (name: string) => Promise<Menu>
  update: (id: string, updates: Partial<Menu>) => Promise<Menu>
  remove: (id: string) => Promise<void>
  setItems: (id: string, items: MenuItem[]) => Promise<Menu>
  sorted: (mode: 'name' | 'updatedAt') => Menu[]
  undoDelete: () => Promise<void>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: [],
  loading: false,
  lastDeleted: undefined,
  load: async () => {
    set({ loading: true })
    const items = await listMenus()
    set({ menus: items, loading: false })
  },
  getById: async (id: string) => {
    const cached = get().menus.find((item) => item.id === id)
    if (cached) {
      return cached
    }
    return getMenu(id)
  },
  add: async (name: string) => {
    const menu = await createMenu({ name })
    await get().load()
    return menu
  },
  update: async (id, updates) => {
    const menu = await updateMenu(id, updates)
    await get().load()
    return menu
  },
  remove: async (id) => {
    const current = get().menus.find((item) => item.id === id)
    await deleteMenu(id)
    set({ lastDeleted: current })
    await get().load()
  },
  setItems: async (id, items) => {
    const menu = await updateMenu(id, { items })
    await get().load()
    return menu
  },
  sorted: (mode) => sortMenus(get().menus, mode),
  undoDelete: async () => {
    const last = get().lastDeleted
    if (!last) return
    await restoreMenu(last.id)
    set({ lastDeleted: undefined })
    await get().load()
  }
}))
