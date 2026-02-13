const { listMenus } = require('../../services/menuService')
const { listDishes } = require('../../services/dishService')

Page({
  data: {
    menu: null,
    dishes: []
  },

  onLoad(query) {
    this.menuId = query.id
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const menu = listMenus().find((item) => item.id === this.menuId)
    const dishes = listDishes()
    this.setData({ menu, dishes })
  },

  goToEdit() {
    wx.navigateTo({ url: `/pages/menu-edit/menu-edit?id=${this.menuId}` })
  },

  goToDish(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  }
})
