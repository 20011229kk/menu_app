const { listMenus, createMenu, deleteMenu, restoreMenu } = require('../../services/menuService')

Page({
  data: {
    name: '',
    menus: [],
    lastDeleted: null
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const menus = listMenus()
    this.setData({ menus })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  addMenu() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '菜单名不能为空', icon: 'none' })
      return
    }
    const exists = this.data.menus.find((item) => item.name === name)
    if (exists) {
      wx.showToast({ title: '菜单名已存在', icon: 'none' })
      return
    }
    const menu = createMenu(name)
    this.setData({ name: '' })
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

  removeMenu(event) {
    const { id } = event.currentTarget.dataset
    const current = this.data.menus.find((item) => item.id === id)
    wx.showModal({
      title: '确认删除',
      content: '删除后可撤销',
      success: (res) => {
        if (!res.confirm) return
        deleteMenu(id)
        this.setData({ lastDeleted: current || null })
        this.refresh()
      }
    })
  },

  undoDelete() {
    const last = this.data.lastDeleted
    if (!last) return
    restoreMenu(last.id)
    this.setData({ lastDeleted: null })
    this.refresh()
  }
})
