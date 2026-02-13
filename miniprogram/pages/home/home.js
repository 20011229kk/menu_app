const { listCategories } = require('../../services/categoryService')
const { listDishes } = require('../../services/dishService')

Page({
  data: {
    view: 'category',
    categories: [],
    categoryCounts: {},
    recentDishes: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const categories = listCategories().sort((a, b) => a.order - b.order)
    const dishes = listDishes()
    const counts = {}
    dishes.forEach((dish) => {
      const key = dish.categoryId || 'uncategorized'
      counts[key] = (counts[key] || 0) + 1
    })
    const recent = dishes
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      .slice(0, 6)
    this.setData({
      categories,
      categoryCounts: counts,
      recentDishes: recent
    })
  },

  switchView(event) {
    const view = event.currentTarget.dataset.view
    this.setData({ view })
  },

  goToDishes() {
    wx.navigateTo({ url: '/pages/dishes/dishes' })
  },

  goToDishDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  }
})
