const { STORAGE_KEYS, readList, writeList } = require('../utils/storage')
const { generateId } = require('../utils/id')
const { nowIso } = require('../utils/time')

function listDishes() {
  return readList(STORAGE_KEYS.dishes).filter((item) => !item.deletedAt)
}

function createDish(input) {
  const now = nowIso()
  const dish = {
    id: generateId(),
    name: input.name.trim(),
    categoryId: input.categoryId ?? null,
    description: input.description ? input.description.trim() : '',
    ingredients: input.ingredients || [],
    steps: input.steps || [],
    cookTime: input.cookTime,
    servings: input.servings,
    difficulty: input.difficulty,
    tips: input.tips ? input.tips.trim() : '',
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  const list = readList(STORAGE_KEYS.dishes)
  list.push(dish)
  writeList(STORAGE_KEYS.dishes, list)
  return dish
}

function updateDish(id, updates) {
  const list = readList(STORAGE_KEYS.dishes)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : item.name,
      description: updates.description !== undefined ? updates.description.trim() : item.description,
      tips: updates.tips !== undefined ? updates.tips.trim() : item.tips,
      updatedAt: nowIso()
    }
  })
  writeList(STORAGE_KEYS.dishes, next)
}

function deleteDish(id) {
  const list = readList(STORAGE_KEYS.dishes)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: nowIso(), updatedAt: nowIso() }
  })
  writeList(STORAGE_KEYS.dishes, next)
}

function restoreDish(id) {
  const list = readList(STORAGE_KEYS.dishes)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: null, updatedAt: nowIso() }
  })
  writeList(STORAGE_KEYS.dishes, next)
}

module.exports = {
  listDishes,
  createDish,
  updateDish,
  deleteDish,
  restoreDish
}
