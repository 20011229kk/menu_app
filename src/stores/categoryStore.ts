import { create } from 'zustand'
import type { Category } from '../models'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/categoryService'
import { sortCategories } from '../utils/sort'

interface CategoryState {
  categories: Category[]
  loading: boolean
  load: () => Promise<void>
  add: (name: string) => Promise<void>
  rename: (id: string, name: string) => Promise<void>
  remove: (id: string) => Promise<void>
  move: (id: string, direction: 'up' | 'down') => Promise<void>
}

function normalizeCategories(items: Category[]): Category[] {
  return sortCategories(items, 'order')
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    const items = await listCategories()
    set({ categories: normalizeCategories(items), loading: false })
  },
  add: async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }
    const current = get().categories
    const maxOrder = current.reduce((max, item) => Math.max(max, item.order), 0)
    await createCategory({ name: trimmed, order: maxOrder + 1 })
    await get().load()
  },
  rename: async (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }
    await updateCategory(id, { name: trimmed })
    await get().load()
  },
  remove: async (id: string) => {
    await deleteCategory(id)
    await get().load()
  },
  move: async (id: string, direction: 'up' | 'down') => {
    const items = normalizeCategories(get().categories)
    const index = items.findIndex((item) => item.id === id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
      return
    }
    const current = items[index]
    const target = items[targetIndex]
    await updateCategory(current.id, { order: target.order })
    await updateCategory(target.id, { order: current.order })
    await get().load()
  }
}))
