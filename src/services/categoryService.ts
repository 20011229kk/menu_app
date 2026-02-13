import type { Category } from '../models'
import { db } from './db'
import { generateId } from '../utils/id'
import { nowIso } from '../utils/time'

export async function listCategories(): Promise<Category[]> {
  return db.categories.filter((item) => !item.deletedAt).toArray()
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return db.categories.get(id)
}

export async function createCategory(input: Pick<Category, 'name' | 'order'>): Promise<Category> {
  const now = nowIso()
  const category: Category = {
    id: generateId(),
    name: input.name.trim(),
    order: input.order,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  await db.categories.add(category)
  return category
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, 'name' | 'order'>>
): Promise<Category> {
  const category = await db.categories.get(id)
  if (!category) {
    throw new Error('分类不存在')
  }
  const updated: Category = {
    ...category,
    name: updates.name !== undefined ? updates.name.trim() : category.name,
    order: updates.order ?? category.order,
    updatedAt: nowIso()
  }
  await db.categories.put(updated)
  return updated
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', db.categories, db.dishes, async () => {
    const category = await db.categories.get(id)
    if (!category) {
      return
    }
    await db.categories.put({
      ...category,
      deletedAt: nowIso(),
      updatedAt: nowIso()
    })
    const relatedDishes = await db.dishes.where('categoryId').equals(id).toArray()
    for (const dish of relatedDishes) {
      await db.dishes.put({
        ...dish,
        categoryId: null,
        updatedAt: nowIso()
      })
    }
  })
}
