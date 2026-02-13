const { STORAGE_KEYS, writeList } = require('../utils/storage')
const { repairData } = require('../utils/repair')

function parsePayload(text) {
  const payload = JSON.parse(text)
  if (!payload || !Array.isArray(payload.categories) || !Array.isArray(payload.dishes) || !Array.isArray(payload.menus)) {
    throw new Error('导入文件格式不正确')
  }
  return payload
}

function importJson(text) {
  const payload = parsePayload(text)
  writeList(STORAGE_KEYS.categories, payload.categories)
  writeList(STORAGE_KEYS.dishes, payload.dishes)
  writeList(STORAGE_KEYS.menus, payload.menus)
  const repaired = repairData()
  return {
    categories: repaired.categories.length,
    dishes: repaired.dishes.length,
    menus: repaired.menus.length
  }
}

module.exports = {
  importJson
}
