const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
} = require('../../services/categoryService')
const { validateRequired, validateUnique } = require('../../utils/validation')
const { on, off } = require('../../utils/events')
const { confirmDelete } = require('../../utils/confirm')
const { showError } = require('../../utils/errors')

Page({
  data: {
    categories: [],
    name: '',
    editingId: '',
    editingName: '',
    lastDeleted: null,
    error: '',
    vanThemeVars: {
      buttonPrimaryBackgroundColor: '#ffd6e6',
      buttonPrimaryBorderColor: '#ffd6e6',
      buttonPrimaryColor: '#b04b67',
      buttonDefaultBackgroundColor: '#fff3f7',
      buttonDefaultBorderColor: 'rgba(255, 173, 199, 0.7)',
      buttonDefaultColor: '#b04b67'
    }
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
    this.setData({ categories })
  },

  onNameInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ name: value })
  },

  addCategory() {
    const name = this.data.name.trim()
    const requiredError = validateRequired(name, '分类名')
    if (requiredError) {
      this.setData({ error: requiredError })
      showError(null, requiredError)
      return
    }
    const uniqueError = validateUnique(name, this.data.categories, '分类名')
    if (uniqueError) {
      this.setData({ error: uniqueError })
      showError(null, uniqueError)
      return
    }
    const maxOrder = this.data.categories.reduce((max, item) => Math.max(max, item.order), 0)
    createCategory(name, maxOrder + 1)
    this.setData({ name: '', error: '' })
    this.refresh()
  },

  startEdit(event) {
    const { id, name } = event.currentTarget.dataset
    this.setData({ editingId: id, editingName: name })
  },

  onEditInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ editingName: value })
  },

  saveEdit() {
    const { editingId, editingName, categories } = this.data
    if (!editingId) return
    const name = editingName.trim()
    const requiredError = validateRequired(name, '分类名')
    if (requiredError) {
      this.setData({ error: requiredError })
      showError(null, requiredError)
      return
    }
    const uniqueError = validateUnique(name, categories, '分类名', editingId)
    if (uniqueError) {
      this.setData({ error: uniqueError })
      showError(null, uniqueError)
      return
    }
    updateCategory(editingId, { name })
    this.setData({ editingId: '', editingName: '', error: '' })
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

  async removeCategory(event) {
    const { id } = event.currentTarget.dataset
    const current = this.data.categories.find((item) => item.id === id)
    const confirmed = await confirmDelete('删除分类后菜品将转为未分类')
    if (!confirmed) return
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
