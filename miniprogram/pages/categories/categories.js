const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
} = require('../../services/categoryService')

Page({
  data: {
    categories: [],
    name: '',
    editingId: '',
    editingName: '',
    lastDeleted: null
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const categories = listCategories().sort((a, b) => a.order - b.order)
    this.setData({ categories })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  addCategory() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '分类名不能为空', icon: 'none' })
      return
    }
    const exists = this.data.categories.find((item) => item.name === name)
    if (exists) {
      wx.showToast({ title: '分类名已存在', icon: 'none' })
      return
    }
    const maxOrder = this.data.categories.reduce((max, item) => Math.max(max, item.order), 0)
    createCategory(name, maxOrder + 1)
    this.setData({ name: '' })
    this.refresh()
  },

  startEdit(event) {
    const { id, name } = event.currentTarget.dataset
    this.setData({ editingId: id, editingName: name })
  },

  onEditInput(event) {
    this.setData({ editingName: event.detail.value })
  },

  saveEdit() {
    const { editingId, editingName, categories } = this.data
    if (!editingId) return
    const name = editingName.trim()
    if (!name) {
      wx.showToast({ title: '分类名不能为空', icon: 'none' })
      return
    }
    const exists = categories.find((item) => item.name === name && item.id !== editingId)
    if (exists) {
      wx.showToast({ title: '分类名已存在', icon: 'none' })
      return
    }
    updateCategory(editingId, { name })
    this.setData({ editingId: '', editingName: '' })
    this.refresh()
  },

  moveCategory(event) {
    const { id, direction } = event.currentTarget.dataset
    const list = this.data.categories.slice()
    const index = list.findIndex((item) => item.id === id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || targetIndex < 0 || targetIndex >= list.length) return
    const current = list[index]
    const target = list[targetIndex]
    updateCategory(current.id, { order: target.order })
    updateCategory(target.id, { order: current.order })
    this.refresh()
  },

  removeCategory(event) {
    const { id } = event.currentTarget.dataset
    const current = this.data.categories.find((item) => item.id === id)
    deleteCategory(id)
    this.setData({ lastDeleted: current || null })
    this.refresh()
  },

  undoDelete() {
    const last = this.data.lastDeleted
    if (!last) return
    restoreCategory(last.id)
    this.setData({ lastDeleted: null })
    this.refresh()
  }
})
