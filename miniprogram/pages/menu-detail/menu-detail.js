const { listMenus } = require('../../services/menuService')
const { listDishes } = require('../../services/dishService')
const { on, off } = require('../../utils/events')
const { getTempUrl } = require('../../utils/cloudFile')

Page({
  data: {
    menu: null,
    items: [],
    coverUrl: ''
  },

  onLoad(query) {
    this.menuId = query.id
    this._dataChangedHandler = () => this.loadData()
    on('data:changed', this._dataChangedHandler)
  },

  onShow() {
    this.loadData()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  async loadData() {
    const menu = listMenus().find((item) => item.id === this.menuId)
    const dishes = listDishes()
    const dishMap = {}
    dishes.forEach((dish) => {
      dishMap[dish.id] = dish.name
    })
    const items = (menu ? menu.items : []).map((item) => ({
      ...item,
      dishName: dishMap[item.dishId] || '菜品已删除'
    }))
    let coverUrl = menu ? menu.coverImage || '' : ''
    if (menu && menu.coverImageFileId) {
      const url = await getTempUrl(menu.coverImageFileId)
      if (url) coverUrl = url
    }
    this.setData({ menu, items, coverUrl })
  },

  goToEdit() {
    wx.navigateTo({ url: `/pages/menu-edit/menu-edit?id=${this.menuId}` })
  },

  goToDish(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  }
})
