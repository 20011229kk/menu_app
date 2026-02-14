const { STORAGE_KEYS, readList, writeList } = require('./storage')
const { repairData } = require('./repair')
const { uploadImage } = require('./cloudFile')
const { nowIso } = require('./time')

const SYNC_KEYS = {
  enabled: 'menu_app_sync_enabled',
  coupleId: 'menu_app_couple_id',
  lastSync: 'menu_app_last_sync'
}

const GALLERY_KEYS = {
  fileId: 'menu_app_gallery_image_file_id',
  updatedAt: 'menu_app_gallery_image_updated_at'
}

let syncing = false
let pending = false
let timer = null

function initCloud() {
  if (!wx.cloud) return
  wx.cloud.init({
    env: 'cloud1-0gq8eadpe4785d9c',
    traceUser: true
  })
}

function getSyncEnabled() {
  return !!wx.getStorageSync(SYNC_KEYS.enabled)
}

function setSyncEnabled(value) {
  wx.setStorageSync(SYNC_KEYS.enabled, value)
}

function getCoupleId() {
  return wx.getStorageSync(SYNC_KEYS.coupleId)
}

function setCoupleId(value) {
  wx.setStorageSync(SYNC_KEYS.coupleId, value)
}

function getLastSync() {
  return wx.getStorageSync(SYNC_KEYS.lastSync)
}

function setLastSync(value) {
  wx.setStorageSync(SYNC_KEYS.lastSync, value)
}

function getGalleryMeta() {
  return {
    fileId: wx.getStorageSync(GALLERY_KEYS.fileId) || '',
    updatedAt: wx.getStorageSync(GALLERY_KEYS.updatedAt) || ''
  }
}

function setGalleryMeta(fileId, updatedAt) {
  if (fileId !== undefined) {
    wx.setStorageSync(GALLERY_KEYS.fileId, fileId || '')
  }
  if (updatedAt !== undefined) {
    wx.setStorageSync(GALLERY_KEYS.updatedAt, updatedAt || '')
  }
}

async function callFunction(name, data) {
  const res = await wx.cloud.callFunction({ name, data })
  return res.result
}

async function createInvite(options = {}) {
  const result = await callFunction('coupleCreate', { forceNew: !!options.forceNew })
  if (result.coupleId) {
    const previous = getCoupleId()
    setCoupleId(result.coupleId)
    if (previous !== result.coupleId) {
      setLastSync('')
    }
  }
  return result
}

async function joinInvite(code) {
  const result = await callFunction('coupleJoin', { code })
  if (result.ok && result.coupleId) {
    const previous = getCoupleId()
    setCoupleId(result.coupleId)
    if (previous !== result.coupleId) {
      setLastSync('')
    }
  }
  return result
}

async function syncNow() {
  if (syncing) {
    pending = true
    return
  }
  const coupleId = getCoupleId()
  if (!coupleId) {
    return { ok: false, message: '未绑定共享空间' }
  }
  syncing = true
  await ensureImageUploads(coupleId)
  const galleryMeta = getGalleryMeta()
  const payload = {
    categories: readList(STORAGE_KEYS.categories),
    dishes: readList(STORAGE_KEYS.dishes),
    menus: readList(STORAGE_KEYS.menus),
    gallery: galleryMeta.fileId || galleryMeta.updatedAt ? galleryMeta : null
  }
  const lastSync = getLastSync()
  const result = await callFunction('sync', {
    coupleId,
    payload,
    lastSync
  })

  if (result && result.ok) {
    if (Array.isArray(result.categories)) {
      writeList(STORAGE_KEYS.categories, mergeList(payload.categories, result.categories))
    }
    if (Array.isArray(result.dishes)) {
      writeList(STORAGE_KEYS.dishes, mergeList(payload.dishes, result.dishes))
    }
    if (Array.isArray(result.menus)) {
      writeList(STORAGE_KEYS.menus, mergeList(payload.menus, result.menus))
    }
    if (result.gallery && result.gallery.updatedAt) {
      const local = getGalleryMeta()
      if (!local.updatedAt || String(result.gallery.updatedAt) > String(local.updatedAt)) {
        setGalleryMeta(result.gallery.fileId || '', result.gallery.updatedAt || '')
      }
    }
    repairData()
    setLastSync(result.serverTime || new Date().toISOString())
  }

  syncing = false
  if (pending) {
    pending = false
    await syncNow()
  }
  return result
}

function mergeList(local, remote) {
  const map = new Map()
  local.forEach((item) => map.set(item.id, item))
  remote.forEach((item) => {
    const existing = map.get(item.id)
    if (!existing || String(item.updatedAt) > String(existing.updatedAt)) {
      map.set(item.id, item)
    }
  })
  return Array.from(map.values())
}

function scheduleSync() {
  if (!getSyncEnabled()) return
  if (timer) return
  timer = setTimeout(async () => {
    timer = null
    try {
      await syncNow()
    } catch (_) {
      // ignore
    }
  }, 1200)
}

async function autoSyncIfEnabled() {
  if (!getSyncEnabled()) return
  if (!getCoupleId()) return
  try {
    await syncNow()
  } catch (_) {
    // ignore
  }
}

async function ensureImageUploads(coupleId) {
  if (!wx.cloud || !coupleId) return
  const dishes = readList(STORAGE_KEYS.dishes)
  const menus = readList(STORAGE_KEYS.menus)
  const galleryPath = wx.getStorageSync('menu_app_gallery_image')
  const galleryMeta = getGalleryMeta()
  let dishesChanged = false
  let menusChanged = false

  for (const dish of dishes) {
    if (!dish.coverImage || dish.coverImageFileId) continue
    const fileId = await uploadImage(dish.coverImage, coupleId, 'dish-covers')
    if (!fileId) continue
    dish.coverImageFileId = fileId
    dish.updatedAt = nowIso()
    dishesChanged = true
  }

  for (const menu of menus) {
    if (!menu.coverImage || menu.coverImageFileId) continue
    const fileId = await uploadImage(menu.coverImage, coupleId, 'menu-covers')
    if (!fileId) continue
    menu.coverImageFileId = fileId
    menu.updatedAt = nowIso()
    menusChanged = true
  }

  if (dishesChanged) {
    writeList(STORAGE_KEYS.dishes, dishes)
  }
  if (menusChanged) {
    writeList(STORAGE_KEYS.menus, menus)
  }

  if (galleryPath && !galleryMeta.fileId) {
    const fileId = await uploadImage(galleryPath, coupleId, 'gallery')
    if (fileId) {
      setGalleryMeta(fileId, nowIso())
    }
  }
}

module.exports = {
  initCloud,
  getSyncEnabled,
  setSyncEnabled,
  getCoupleId,
  setCoupleId,
  getLastSync,
  setLastSync,
  getGalleryMeta,
  setGalleryMeta,
  createInvite,
  joinInvite,
  syncNow,
  scheduleSync,
  autoSyncIfEnabled
}
