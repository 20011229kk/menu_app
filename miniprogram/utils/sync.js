const { STORAGE_KEYS, readList, writeList } = require('./storage')
const { repairData } = require('./repair')

const SYNC_KEYS = {
  enabled: 'menu_app_sync_enabled',
  coupleId: 'menu_app_couple_id',
  lastSync: 'menu_app_last_sync'
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

async function callFunction(name, data) {
  const res = await wx.cloud.callFunction({ name, data })
  return res.result
}

async function createInvite() {
  const result = await callFunction('coupleCreate', {})
  if (result.coupleId) {
    setCoupleId(result.coupleId)
  }
  return result
}

async function joinInvite(code) {
  const result = await callFunction('coupleJoin', { code })
  if (result.ok && result.coupleId) {
    setCoupleId(result.coupleId)
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
  const payload = {
    categories: readList(STORAGE_KEYS.categories),
    dishes: readList(STORAGE_KEYS.dishes),
    menus: readList(STORAGE_KEYS.menus)
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

module.exports = {
  initCloud,
  getSyncEnabled,
  setSyncEnabled,
  getCoupleId,
  setCoupleId,
  getLastSync,
  setLastSync,
  createInvite,
  joinInvite,
  syncNow,
  scheduleSync
}
