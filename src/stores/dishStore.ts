import { create } from 'zustand'
import type { Dish } from '../models'
import { createDish, deleteDish, getDish, listDishes, updateDish } from '../services/dishService'
import { sortDishes } from '../utils/sort'

interface DishState {
  dishes: Dish[]
  loading: boolean
  load: () => Promise<void>
  getById: (id: string) => Promise<Dish | undefined>
  add: (input: Parameters<typeof createDish>[0]) => Promise<Dish>
  update: (id: string, updates: Partial<Dish>) => Promise<Dish>
  remove: (id: string) => Promise<void>
  sorted: (mode: 'name' | 'updatedAt') => Dish[]
}

export const useDishStore = create<DishState>((set, get) => ({
  dishes: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    const items = await listDishes()
    set({ dishes: items, loading: false })
  },
  getById: async (id: string) => {
    const cached = get().dishes.find((item) => item.id === id)
    if (cached) {
      return cached
    }
    return getDish(id)
  },
  add: async (input) => {
    const dish = await createDish(input)
    await get().load()
    return dish
  },
  update: async (id, updates) => {
    const dish = await updateDish(id, updates)
    await get().load()
    return dish
  },
  remove: async (id) => {
    await deleteDish(id)
    await get().load()
  },
  sorted: (mode) => sortDishes(get().dishes, mode)
}))
