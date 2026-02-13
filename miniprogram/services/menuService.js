const { STORAGE_KEYS, readList, writeList } = require('../utils/storage')
const { generateId } = require('../utils/id')
const { nowIso } = require('../utils/time')

function listMenus() {
  return readList(STORAGE_KEYS.menus).filter((item) => !item.deletedAt)
}

function createMenu(name, coverImage) {
  const now = nowIso()
  const menu = {
    id: generateId(),
    name: name.trim(),
    coverImage: coverImage || '',
    items: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
  const list = readList(STORAGE_KEYS.menus)
  list.push(menu)
  writeList(STORAGE_KEYS.menus, list)
  return menu
}

function updateMenu(id, updates) {
  const list = readList(STORAGE_KEYS.menus)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : item.name,
      updatedAt: nowIso()
    }
  })
  writeList(STORAGE_KEYS.menus, next)
}

function deleteMenu(id) {
  const list = readList(STORAGE_KEYS.menus)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: nowIso(), updatedAt: nowIso() }
  })
  writeList(STORAGE_KEYS.menus, next)
}

function restoreMenu(id) {
  const list = readList(STORAGE_KEYS.menus)
  const next = list.map((item) => {
    if (item.id !== id) return item
    return { ...item, deletedAt: null, updatedAt: nowIso() }
  })
  writeList(STORAGE_KEYS.menus, next)
}

module.exports = {
  listMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  restoreMenu
}
