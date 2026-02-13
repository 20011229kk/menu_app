import { create } from 'zustand'
import type { Menu, MenuItem } from '../models'
import { createMenu, deleteMenu, getMenu, listMenus, updateMenu } from '../services/menuService'
import { sortMenus } from '../utils/sort'

interface MenuState {
  menus: Menu[]
  loading: boolean
  load: () => Promise<void>
  getById: (id: string) => Promise<Menu | undefined>
  add: (name: string) => Promise<Menu>
  update: (id: string, updates: Partial<Menu>) => Promise<Menu>
  remove: (id: string) => Promise<void>
  setItems: (id: string, items: MenuItem[]) => Promise<Menu>
  sorted: (mode: 'name' | 'updatedAt') => Menu[]
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: [],
  loading: false,
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
    await deleteMenu(id)
    await get().load()
  },
  setItems: async (id, items) => {
    const menu = await updateMenu(id, { items })
    await get().load()
    return menu
  },
  sorted: (mode) => sortMenus(get().menus, mode)
}))
