import type { Category, Dish, Menu } from '../models'

export function validateCategoryName(name: string, existing: Category[], currentId?: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return '分类名不能为空'
  const conflict = existing.find((item) => item.name === trimmed && item.id !== currentId)
  if (conflict) return '分类名已存在'
  return null
}

export function validateDishName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return '菜名不能为空'
  return null
}

export function validateMenuName(name: string, existing: Menu[], currentId?: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return '菜单名不能为空'
  const conflict = existing.find((item) => item.name === trimmed && item.id !== currentId)
  if (conflict) return '菜单名已存在'
  return null
}

export function validateSteps(steps: Dish['steps']): string | null {
  if (steps.some((step) => !step.content.trim())) {
    return '步骤内容不能为空'
  }
  return null
}

export function validateIngredients(ingredients: Dish['ingredients']): string | null {
  if (ingredients.some((item) => !item.name.trim())) {
    return '用料名称不能为空'
  }
  return null
}
