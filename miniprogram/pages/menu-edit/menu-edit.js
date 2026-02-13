const { listMenus, updateMenu } = require('../../services/menuService')
const { listDishes } = require('../../services/dishService')
const { generateId } = require('../../utils/id')

Page({
  data: {
    id: '',
    name: '',
    dishes: [],
    menuItems: [],
    selectedDishIndex: 0
  },

  onLoad(query) {
    const menus = listMenus()
    const menu = menus.find((item) => item.id === query.id)
    const dishes = listDishes()
    this.setData({
      id: query.id,
      name: menu ? menu.name : '',
      dishes,
      menuItems: menu ? menu.items : []
    })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  onDishSelect(event) {
    this.setData({ selectedDishIndex: Number(event.detail.value) })
  },

  addDish() {
    const dish = this.data.dishes[this.data.selectedDishIndex]
    if (!dish) {
      wx.showToast({ title: '请选择菜品', icon: 'none' })
      return
    }
    const maxOrder = this.data.menuItems.reduce((max, item) => Math.max(max, item.order), 0)
    const next = this.data.menuItems.concat({
      id: generateId(),
      dishId: dish.id,
      order: maxOrder + 1,
      note: ''
    })
    this.setData({ menuItems: next })
  },

  updateNote(event) {
    const { index } = event.currentTarget.dataset
    const value = event.detail.value
    const next = this.data.menuItems.slice()
    next[index].note = value
    this.setData({ menuItems: next })
  },

  moveItem(event) {
    const { index, direction } = event.currentTarget.dataset
    const list = this.data.menuItems.slice()
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= list.length) return
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
    list.forEach((item, idx) => {
      item.order = idx + 1
    })
    this.setData({ menuItems: list })
  },

  removeItem(event) {
    const index = Number(event.currentTarget.dataset.index)
    const list = this.data.menuItems.slice()
    list.splice(index, 1)
    list.forEach((item, idx) => {
      item.order = idx + 1
    })
    this.setData({ menuItems: list })
  },

  saveMenu() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '菜单名不能为空', icon: 'none' })
      return
    }
    updateMenu(this.data.id, { name, items: this.data.menuItems })
    wx.navigateBack()
  }
})
