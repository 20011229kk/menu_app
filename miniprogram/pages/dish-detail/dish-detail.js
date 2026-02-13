const { listDishes, deleteDish, restoreDish } = require('../../services/dishService')

Page({
  data: {
    dish: null,
    lastDeleted: null
  },

  onLoad(query) {
    this.dishId = query.id
  },

  onShow() {
    this.loadDish()
  },

  loadDish() {
    const dishes = listDishes()
    const dish = dishes.find((item) => item.id === this.dishId)
    this.setData({ dish })
  },

  goToEdit() {
    wx.navigateTo({ url: `/pages/dish-edit/dish-edit?id=${this.dishId}` })
  },

  removeDish() {
    const dish = this.data.dish
    if (!dish) return
    wx.showModal({
      title: '确认删除',
      content: '删除后可在当前页撤销',
      success: (res) => {
        if (!res.confirm) return
        deleteDish(dish.id)
        this.setData({ lastDeleted: dish, dish: null })
      }
    })
  },

  undoDelete() {
    const last = this.data.lastDeleted
    if (!last) return
    restoreDish(last.id)
    this.setData({ lastDeleted: null })
    this.loadDish()
  }
})
