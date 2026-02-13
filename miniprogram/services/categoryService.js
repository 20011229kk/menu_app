const { STORAGE_KEYS, readList, writeList } = require('../utils/storage')
const { generateId } = require('../utils/id')
const { nowIso } = require('../utils/time')

function listCategories() {
  return readList(STORAGE_KEYS.categories).filter((item) => !item.deletedAt)
}

function createCategory(name, order) {
  const now = nowIso()
  const category = {
    id: generateId(),
    name: name.trim(),
    order,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  const list = readList(STORAGE_KEYS.categories)
  list.push(category)
  writeList(STORAGE_KEYS.categories, list)
  return category
}

function updateCategory(id, updates) {
  const list = readList(STORAGE_KEYS.categories)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : item.name,
      updatedAt: nowIso()
    }
  })
  writeList(STORAGE_KEYS.categories, next)
}

function deleteCategory(id) {
  const categories = readList(STORAGE_KEYS.categories)
  const dishes = readList(STORAGE_KEYS.dishes)
  const now = nowIso()
  const nextCategories = categories.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: now, updatedAt: now }
  })
  const nextDishes = dishes.map((dish) => {
    if (dish.categoryId !== id) return dish
    return { ...dish, categoryId: null, updatedAt: now }
  })
  writeList(STORAGE_KEYS.categories, nextCategories)
  writeList(STORAGE_KEYS.dishes, nextDishes)
}

function restoreCategory(id) {
  const list = readList(STORAGE_KEYS.categories)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: null, updatedAt: nowIso() }
  })
  writeList(STORAGE_KEYS.categories, next)
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
}
