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

async function readCloudImageBase64(fileId) {
  if (!fileId || !wx.cloud) return null
  try {
    const res = await wx.cloud.downloadFile({ fileID: fileId })
    const tempPath = res && res.tempFilePath
    return readImageBase64(tempPath)
  } catch (error) {
    return null
  }
}

async function buildExportPayload() {
  const categories = readList(STORAGE_KEYS.categories).filter((item) => !item.deletedAt)
  const dishes = readList(STORAGE_KEYS.dishes).filter((item) => !item.deletedAt)
  const menus = readList(STORAGE_KEYS.menus).filter((item) => !item.deletedAt)
  const images = {
    dishes: {},
    menus: {},
    gallery: null
  }

  for (const dish of dishes) {
    let entry = null
    if (dish.coverImageFileId) {
      entry = await readCloudImageBase64(dish.coverImageFileId)
    }
    if (!entry) {
      entry = readImageBase64(dish.coverImage)
    }
    if (entry) {
      images.dishes[dish.id] = entry
    }
  }

  for (const menu of menus) {
    let entry = null
    if (menu.coverImageFileId) {
      entry = await readCloudImageBase64(menu.coverImageFileId)
    }
    if (!entry) {
      entry = readImageBase64(menu.coverImage)
    }
    if (entry) {
      images.menus[menu.id] = entry
    }
  }

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
  const payload = await buildExportPayload()
  return JSON.stringify(payload, null, 2)
}

module.exports = {
  exportJson
}
