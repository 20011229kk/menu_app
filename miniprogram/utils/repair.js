const { STORAGE_KEYS, readList, writeList } = require('./storage')
const { generateId } = require('./id')
const { nowIso } = require('./time')

function normalizeCategories(categories) {
  const sorted = categories.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
  return sorted.map((item, index) => ({
    ...item,
    order: index + 1,
    name: String(item.name || '').trim(),
    updatedAt: item.updatedAt || nowIso(),
    createdAt: item.createdAt || nowIso()
  }))
}

function normalizeIngredients(ingredients) {
  return (ingredients || []).map((item) => ({
    id: item.id || generateId(),
    name: String(item.name || '').trim(),
    amount: item.amount,
    unit: item.unit || '',
    note: item.note || ''
  }))
}

function normalizeSteps(steps) {
  const list = (steps || []).map((item) => ({
    id: item.id || generateId(),
    content: String(item.content || '').trim(),
    timerMinutes: item.timerMinutes,
    imagePlaceholder: item.imagePlaceholder
  }))
  return list.map((item, index) => ({
    ...item,
    order: index + 1
  }))
}

function normalizeDishes(dishes) {
  return dishes.map((item) => ({
    ...item,
    id: item.id || generateId(),
    name: String(item.name || '').trim(),
    coverImage: item.coverImage || '',
    coverImageFileId: item.coverImageFileId || '',
    categoryId: item.categoryId || null,
    description: item.description || '',
    ingredients: normalizeIngredients(item.ingredients),
    steps: normalizeSteps(item.steps),
    tips: item.tips || '',
    updatedAt: item.updatedAt || nowIso(),
    createdAt: item.createdAt || nowIso()
  }))
}

function normalizeMenuItems(items) {
  const list = (items || []).map((item) => ({
    id: item.id || generateId(),
    dishId: item.dishId,
    servings: item.servings,
    note: item.note || ''
  }))
  return list.map((item, index) => ({
    ...item,
    order: index + 1
  }))
}

function normalizeMenus(menus) {
  return menus.map((item) => ({
    ...item,
    id: item.id || generateId(),
    name: String(item.name || '').trim(),
    coverImage: item.coverImage || '',
    coverImageFileId: item.coverImageFileId || '',
    items: normalizeMenuItems(item.items),
    updatedAt: item.updatedAt || nowIso(),
    createdAt: item.createdAt || nowIso()
  }))
}

function repairData() {
  const categories = normalizeCategories(readList(STORAGE_KEYS.categories))
  const dishes = normalizeDishes(readList(STORAGE_KEYS.dishes))
  const menus = normalizeMenus(readList(STORAGE_KEYS.menus))
  writeList(STORAGE_KEYS.categories, categories)
  writeList(STORAGE_KEYS.dishes, dishes)
  writeList(STORAGE_KEYS.menus, menus)
  return { categories, dishes, menus }
}

module.exports = {
  repairData
}
