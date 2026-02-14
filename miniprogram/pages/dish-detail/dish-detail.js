const { listDishes, deleteDish, restoreDish } = require('../../services/dishService')
const { on, off } = require('../../utils/events')
const { confirmDelete } = require('../../utils/confirm')
const { getTempUrl } = require('../../utils/cloudFile')

Page({
  data: {
    dish: null,
    lastDeleted: null,
    coverUrl: ''
  },

  onLoad(query) {
    this.dishId = query.id
    this._dataChangedHandler = () => this.loadDish()
    on('data:changed', this._dataChangedHandler)
  },

  onShow() {
    this.loadDish()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  async loadDish() {
    const dishes = listDishes()
    const dish = dishes.find((item) => item.id === this.dishId)
    let coverUrl = dish ? dish.coverImage || '' : ''
    if (dish && dish.coverImageFileId) {
      const url = await getTempUrl(dish.coverImageFileId)
      if (url) coverUrl = url
    }
    this.setData({ dish, coverUrl })
  },

  goToEdit() {
    wx.navigateTo({ url: `/pages/dish-edit/dish-edit?id=${this.dishId}` })
  },

  async removeDish() {
    const dish = this.data.dish
    if (!dish) return
    const confirmed = await confirmDelete('删除后可在当前页撤销')
    if (!confirmed) return
    deleteDish(dish.id)
    this.setData({ lastDeleted: dish, dish: null })
  },

  undoDelete() {
    const last = this.data.lastDeleted
    if (!last) return
    restoreDish(last.id)
    this.setData({ lastDeleted: null })
    this.loadDish()
  }
})
