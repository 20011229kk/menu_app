const { listDishes } = require('../../services/dishService')
const { listCategories } = require('../../services/categoryService')
const { on, off } = require('../../utils/events')
const { getTempUrl } = require('../../utils/cloudFile')

Page({
  data: {
    query: '',
    sortMode: 'name',
    selectedCategory: 'all',
    selectedCategoryLabel: '全部分类',
    categories: [],
    categoryOptions: [],
    dishes: [],
    filtered: [],
    imageMap: {}
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
    const categories = listCategories().sort((a, b) => a.order - b.order)
    const dishes = listDishes()
    const categoryOptions = [{ id: 'all', name: '全部分类' }, ...categories]
    this.setData({ categories, dishes, categoryOptions })
    this.applyFilters()
    this.resolveDishImages(dishes)
  },

  async resolveDishImages(dishes) {
    const map = {}
    for (const dish of dishes) {
      if (dish.coverImageFileId) {
        const url = await getTempUrl(dish.coverImageFileId)
        if (url) {
          map[dish.id] = url
          continue
        }
      }
      if (dish.coverImage) {
        map[dish.id] = dish.coverImage
      }
    }
    this.setData({ imageMap: map })
  },

  onQueryInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ query: value })
    this.applyFilters()
  },

  onCategoryChange(event) {
    const index = Number(event.detail.value)
    const selected = this.data.categoryOptions[index]
    this.setData({ selectedCategory: selected.id, selectedCategoryLabel: selected.name })
    this.applyFilters()
  },

  onCategorySelect(event) {
    const id = event.currentTarget.dataset.id
    const label = event.currentTarget.dataset.name
    this.setData({ selectedCategory: id, selectedCategoryLabel: label })
    this.applyFilters()
  },

  switchSort(event) {
    this.setData({ sortMode: event.currentTarget.dataset.mode })
    this.applyFilters()
  },

  applyFilters() {
    const { query, selectedCategory, dishes, sortMode } = this.data
    const keyword = query.trim().toLowerCase()
    let next = dishes.filter((dish) => {
      const haystack = [dish.name, dish.description || '', (dish.ingredients || []).map((i) => i.name).join(' ')]
        .join(' ')
        .toLowerCase()
      if (keyword && !haystack.includes(keyword)) return false
      if (selectedCategory === 'all') return true
      if (selectedCategory === 'uncategorized') return !dish.categoryId
      return dish.categoryId === selectedCategory
    })

    next = next.slice().sort((a, b) => {
      if (sortMode === 'updatedAt') {
        return String(b.updatedAt).localeCompare(String(a.updatedAt))
      }
      return String(a.name).localeCompare(String(b.name))
    })

    this.setData({ filtered: next })
  },

  goToNew() {
    wx.navigateTo({ url: '/pages/dish-edit/dish-edit' })
  },

  goToDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/dish-detail/dish-detail?id=${id}` })
  }
})
