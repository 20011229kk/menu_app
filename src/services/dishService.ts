import type { Dish, IngredientItem, StepItem } from '../models'
import { db } from './db'
import { generateId } from '../utils/id'
import { nowIso } from '../utils/time'

export async function listDishes(): Promise<Dish[]> {
  return db.dishes.filter((item) => !item.deletedAt).toArray()
}

export async function getDish(id: string): Promise<Dish | undefined> {
  return db.dishes.get(id)
}

export async function createDish(input: {
  name: string
  categoryId?: string | null
  description?: string
  ingredients?: IngredientItem[]
  steps?: StepItem[]
  cookTime?: number
  servings?: number
  difficulty?: Dish['difficulty']
  tips?: string
}): Promise<Dish> {
  const now = nowIso()
  const dish: Dish = {
    id: generateId(),
    name: input.name.trim(),
    categoryId: input.categoryId ?? null,
    description: input.description?.trim(),
    ingredients: input.ingredients ?? [],
    steps: input.steps ?? [],
    cookTime: input.cookTime,
    servings: input.servings,
    difficulty: input.difficulty,
    tips: input.tips?.trim(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  await db.dishes.add(dish)
  return dish
}

export async function updateDish(id: string, updates: Partial<Dish>): Promise<Dish> {
  const dish = await db.dishes.get(id)
  if (!dish) {
    throw new Error('菜品不存在')
  }
  const updated: Dish = {
    ...dish,
    ...updates,
    name: updates.name ? updates.name.trim() : dish.name,
    description: updates.description ? updates.description.trim() : dish.description,
    tips: updates.tips ? updates.tips.trim() : dish.tips,
    updatedAt: nowIso()
  }
  await db.dishes.put(updated)
  return updated
}

export async function deleteDish(id: string): Promise<void> {
  const dish = await db.dishes.get(id)
  if (!dish) {
    return
  }
  await db.dishes.put({
    ...dish,
    deletedAt: nowIso(),
    updatedAt: nowIso()
  })
}
