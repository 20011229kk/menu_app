const { listMenus, updateMenu } = require('../../services/menuService')
const { listDishes } = require('../../services/dishService')
const { generateId } = require('../../utils/id')
const { validateRequired, validateUnique } = require('../../utils/validation')
const { on, off } = require('../../utils/events')
const { chooseSingleImage, saveImage } = require('../../utils/files')
const { uploadImage, getTempUrl } = require('../../utils/cloudFile')
const { getSyncEnabled, getCoupleId } = require('../../utils/sync')
const { showError } = require('../../utils/errors')

Page({
  data: {
    id: '',
    name: '',
    coverImage: '',
    coverImageFileId: '',
    dishes: [],
    menuItems: [],
    selectedDishIndex: 0,
    error: ''
  },

  onLoad(query) {
    this._menuId = query.id
    this._coverChanged = false
    this._originalCoverImage = ''
    this._originalCoverImageFileId = ''
    this._dataChangedHandler = () => this.refreshData()
    on('data:changed', this._dataChangedHandler)
    this.refreshData()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  async refreshData() {
    const menus = listMenus()
    const menu = menus.find((item) => item.id === this._menuId)
    const dishes = listDishes()
    const dishMap = {}
    dishes.forEach((dish) => {
      dishMap[dish.id] = dish.name
    })
    const menuItems = (menu ? menu.items : []).map((item) => ({
      ...item,
      dishName: dishMap[item.dishId] || '菜品已删除'
    }))
    let coverImage = menu ? menu.coverImage || '' : ''
    const coverImageFileId = menu ? menu.coverImageFileId || '' : ''
    if (coverImageFileId) {
      const url = await getTempUrl(coverImageFileId)
      if (url) coverImage = url
    }
    this._coverChanged = false
    this._originalCoverImage = menu ? menu.coverImage || '' : ''
    this._originalCoverImageFileId = menu ? menu.coverImageFileId || '' : ''
    this.setData({
      id: this._menuId,
      name: menu ? menu.name : '',
      coverImage,
      coverImageFileId,
      dishes,
      menuItems
    })
  },

  onNameInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ name: value })
  },

  async chooseCoverImage() {
    try {
      const tempPath = await chooseSingleImage()
      let fileId = ''
      if (getSyncEnabled() && getCoupleId()) {
        fileId = await uploadImage(tempPath, getCoupleId(), 'menu-covers')
      }
      const savedPath = await saveImage(tempPath)
      this._coverChanged = true
      this.setData({ coverImage: savedPath, coverImageFileId: fileId })
    } catch (error) {
      showError(error, '选择图片失败')
    }
  },

  removeCoverImage() {
    this._coverChanged = true
    this.setData({ coverImage: '', coverImageFileId: '' })
  },

  onDishSelect(event) {
    this.setData({ selectedDishIndex: Number(event.detail.value) })
  },

  addDish() {
    const dish = this.data.dishes[this.data.selectedDishIndex]
    if (!dish) {
      wx.showToast({ title: '请选择菜品', icon: 'none' })
      return
    }
    const maxOrder = this.data.menuItems.reduce((max, item) => Math.max(max, item.order), 0)
    const next = this.data.menuItems.concat({
      id: generateId(),
      dishId: dish.id,
      dishName: dish.name,
      order: maxOrder + 1,
      note: ''
    })
    this.setData({ menuItems: next })
  },

  updateNote(event) {
    const { index } = event.currentTarget.dataset
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    const next = this.data.menuItems.slice()
    next[index].note = value
    this.setData({ menuItems: next })
  },

  moveItem(event) {
    const { index, direction } = event.currentTarget.dataset
    const list = this.data.menuItems.slice()
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= list.length) return
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
    list.forEach((item, idx) => {
      item.order = idx + 1
    })
    this.setData({ menuItems: list })
  },

  removeItem(event) {
    const index = Number(event.currentTarget.dataset.index)
    const list = this.data.menuItems.slice()
    list.splice(index, 1)
    list.forEach((item, idx) => {
      item.order = idx + 1
    })
    this.setData({ menuItems: list })
  },

  saveMenu() {
    const name = this.data.name.trim()
    const requiredError = validateRequired(name, '菜单名')
    if (requiredError) {
      this.setData({ error: requiredError })
      showError(null, requiredError)
      return
    }
    const uniqueError = validateUnique(name, listMenus(), '菜单名', this.data.id)
    if (uniqueError) {
      this.setData({ error: uniqueError })
      showError(null, uniqueError)
      return
    }
    this.setData({ error: '' })
    const payloadItems = this.data.menuItems.map((item) => ({
      id: item.id,
      dishId: item.dishId,
      servings: item.servings,
      order: item.order
    }))
    const coverImage = this._coverChanged || !this.data.id ? this.data.coverImage : this._originalCoverImage
    const coverImageFileId =
      this._coverChanged || !this.data.id ? this.data.coverImageFileId : this._originalCoverImageFileId
    updateMenu(this.data.id, { name, items: payloadItems, coverImage, coverImageFileId })
    wx.navigateBack()
  }
})
