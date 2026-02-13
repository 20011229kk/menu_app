const { listMenus } = require('../../services/menuService')
const { listDishes } = require('../../services/dishService')
const { on, off } = require('../../utils/events')

Page({
  data: {
    menu: null,
    items: []
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

  loadData() {
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
    this.setData({ menu, items })
  },

  goToEdit() {
    wx.navigateTo({ url: `/pages/menu-edit/menu-edit?id=${this.menuId}` })
  },

  goToDish(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  }
})
