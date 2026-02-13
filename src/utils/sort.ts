import type { Category, Dish, Menu } from '../models'

type DishSortMode = 'name' | 'updatedAt'

type MenuSortMode = 'name' | 'updatedAt'

type CategorySortMode = 'order' | 'name'

export function sortCategories(categories: Category[], mode: CategorySortMode): Category[] {
  const items = [...categories]
  if (mode === 'name') {
    return items.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  }
  return items.sort((a, b) => a.order - b.order)
}

export function sortDishes(dishes: Dish[], mode: DishSortMode): Dish[] {
  const items = [...dishes]
  if (mode === 'updatedAt') {
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  return items.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
}

export function sortMenus(menus: Menu[], mode: MenuSortMode): Menu[] {
  const items = [...menus]
  if (mode === 'updatedAt') {
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  return items.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
}
