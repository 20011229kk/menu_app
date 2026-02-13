const { STORAGE_KEYS, readList } = require('../utils/storage')
const { nowIso } = require('../utils/time')

function buildExportPayload() {
  return {
    version: '1.0',
    exportedAt: nowIso(),
    categories: readList(STORAGE_KEYS.categories).filter((item) => !item.deletedAt),
    dishes: readList(STORAGE_KEYS.dishes).filter((item) => !item.deletedAt),
    menus: readList(STORAGE_KEYS.menus).filter((item) => !item.deletedAt)
  }
}

function exportJson() {
  const payload = buildExportPayload()
  return JSON.stringify(payload, null, 2)
}

module.exports = {
  exportJson
}
