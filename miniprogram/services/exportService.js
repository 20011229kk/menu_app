const { STORAGE_KEYS, readList } = require('../utils/storage')
const { nowIso } = require('../utils/time')

function readImageBase64(path) {
  if (!path) return null
  try {
    const fs = wx.getFileSystemManager()
    const data = fs.readFileSync(path, 'base64')
    const ext = String(path).split('.').pop().toLowerCase() || 'jpg'
    return { data, ext }
  } catch (error) {
    return null
  }
}

function buildExportPayload() {
  const categories = readList(STORAGE_KEYS.categories).filter((item) => !item.deletedAt)
  const dishes = readList(STORAGE_KEYS.dishes).filter((item) => !item.deletedAt)
  const menus = readList(STORAGE_KEYS.menus).filter((item) => !item.deletedAt)
  const images = {
    dishes: {},
    menus: {},
    gallery: null
  }

  dishes.forEach((dish) => {
    const entry = readImageBase64(dish.coverImage)
    if (entry) {
      images.dishes[dish.id] = entry
    }
  })

  menus.forEach((menu) => {
    const entry = readImageBase64(menu.coverImage)
    if (entry) {
      images.menus[menu.id] = entry
    }
  })

  const galleryPath = wx.getStorageSync('menu_app_gallery_image')
  const galleryEntry = readImageBase64(galleryPath)
  if (galleryEntry) {
    images.gallery = galleryEntry
  }

  return {
    version: '1.0',
    exportedAt: nowIso(),
    categories,
    dishes,
    menus,
    images
  }
}

async function exportJson() {
  const payload = buildExportPayload()
  return JSON.stringify(payload, null, 2)
}

module.exports = {
  exportJson
}
