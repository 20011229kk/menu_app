const { listMenus, createMenu, deleteMenu, restoreMenu } = require('../../services/menuService')
const { validateRequired, validateUnique } = require('../../utils/validation')
const { on, off } = require('../../utils/events')
const { confirmDelete } = require('../../utils/confirm')
const { chooseSingleImage, saveImage } = require('../../utils/files')
const { showError } = require('../../utils/errors')

Page({
  data: {
    name: '',
    menus: [],
    lastDeleted: null,
    error: '',
    coverImage: ''
  },

  onLoad() {
    this._dataChangedHandler = () => this.refresh()
    on('data:changed', this._dataChangedHandler)
  },

  onShow() {
    this.refresh()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  refresh() {
    const menus = listMenus()
    this.setData({ menus })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  async chooseCoverImage() {
    try {
      const tempPath = await chooseSingleImage()
      const savedPath = await saveImage(tempPath)
      this.setData({ coverImage: savedPath })
    } catch (error) {
      showError(error, '选择图片失败')
    }
  },

  removeCoverImage() {
    this.setData({ coverImage: '' })
  },

  addMenu() {
    const name = this.data.name.trim()
    const requiredError = validateRequired(name, '菜单名')
    if (requiredError) {
      this.setData({ error: requiredError })
      return
    }
    const uniqueError = validateUnique(name, this.data.menus, '菜单名')
    if (uniqueError) {
      this.setData({ error: uniqueError })
      return
    }
    const menu = createMenu(name, this.data.coverImage)
    this.setData({ name: '', error: '', coverImage: '' })
    wx.navigateTo({ url: `/pages/menu-edit/menu-edit?id=${menu.id}` })
  },

  goToDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/menu-detail/menu-detail?id=${id}` })
  },

  goToEdit(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/menu-edit/menu-edit?id=${id}` })
  },

  async removeMenu(event) {
    const { id } = event.currentTarget.dataset
    const current = this.data.menus.find((item) => item.id === id)
    const confirmed = await confirmDelete('删除后可撤销')
    if (!confirmed) return
    deleteMenu(id)
    this.setData({ lastDeleted: current || null })
    this.refresh()
  },

  undoDelete() {
    const last = this.data.lastDeleted
    if (!last) return
    restoreMenu(last.id)
    this.setData({ lastDeleted: null })
    this.refresh()
  }
})
