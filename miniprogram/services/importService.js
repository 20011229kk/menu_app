const { STORAGE_KEYS, writeList } = require('../utils/storage')
const { repairData } = require('../utils/repair')

function parsePayload(text) {
  const payload = JSON.parse(text)
  if (!payload || !Array.isArray(payload.categories) || !Array.isArray(payload.dishes) || !Array.isArray(payload.menus)) {
    throw new Error('导入文件格式不正确')
  }
  return payload
}

function restoreImage(entry, prefix) {
  if (!entry || !entry.data) return ''
  try {
    const fs = wx.getFileSystemManager()
    const ext = entry.ext || 'jpg'
    const name = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = `${wx.env.USER_DATA_PATH}/${name}`
    fs.writeFileSync(filePath, entry.data, 'base64')
    return filePath
  } catch (error) {
    return ''
  }
}

function importJson(text) {
  const payload = parsePayload(text)
  const images = payload.images || {}
  const dishImages = images.dishes || {}
  const menuImages = images.menus || {}
  const galleryImage = images.gallery || null

  const dishes = payload.dishes.map((dish) => {
    const entry = dishImages[dish.id]
    if (!entry) return dish
    const path = restoreImage(entry, 'dish')
    if (!path) return dish
    return { ...dish, coverImage: path }
  })

  const menus = payload.menus.map((menu) => {
    const entry = menuImages[menu.id]
    if (!entry) return menu
    const path = restoreImage(entry, 'menu')
    if (!path) return menu
    return { ...menu, coverImage: path }
  })

  if (galleryImage) {
    const path = restoreImage(galleryImage, 'gallery')
    if (path) {
      wx.setStorageSync('menu_app_gallery_image', path)
    }
  }

  writeList(STORAGE_KEYS.categories, payload.categories)
  writeList(STORAGE_KEYS.dishes, dishes)
  writeList(STORAGE_KEYS.menus, menus)
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
