const STORAGE_KEYS = {
  categories: 'menu_app_categories',
  dishes: 'menu_app_dishes',
  menus: 'menu_app_menus'
}

function readList(key) {
  const value = wx.getStorageSync(key)
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

function writeList(key, list) {
  wx.setStorageSync(key, JSON.stringify(list))
}

function clearLists() {
  writeList(STORAGE_KEYS.categories, [])
  writeList(STORAGE_KEYS.dishes, [])
  writeList(STORAGE_KEYS.menus, [])
}

module.exports = {
  STORAGE_KEYS,
  readList,
  writeList,
  clearLists
}
