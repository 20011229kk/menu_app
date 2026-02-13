const { createDish, updateDish, listDishes } = require('../../services/dishService')
const { listCategories } = require('../../services/categoryService')
const { generateId } = require('../../utils/id')
const { validateRequired, validateIngredients, validateSteps } = require('../../utils/validation')
const { on, off } = require('../../utils/events')

Page({
  data: {
    id: '',
    name: '',
    description: '',
    categoryId: '',
    categoryOptions: [],
    categoryIndex: 0,
    cookTime: '',
    servings: '',
    difficulty: '',
    tips: '',
    ingredients: [],
    steps: [],
    error: ''
  },

  onLoad(query) {
    this._dishId = query.id || ''
    this._dataChangedHandler = () => this.refreshData()
    on('data:changed', this._dataChangedHandler)
    this.refreshData()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  refreshData() {
    const categories = listCategories().sort((a, b) => a.order - b.order)
    const categoryOptions = [{ id: '', name: '未分类' }, ...categories]
    this.setData({ categoryOptions })

    if (this._dishId) {
      const dish = listDishes().find((item) => item.id === this._dishId)
      if (dish) {
        const index = categoryOptions.findIndex((item) => item.id === (dish.categoryId || ''))
        this.setData({
          id: dish.id,
          name: dish.name,
          description: dish.description || '',
          categoryId: dish.categoryId || '',
          categoryIndex: index >= 0 ? index : 0,
          cookTime: dish.cookTime || '',
          servings: dish.servings || '',
          difficulty: dish.difficulty || '',
          tips: dish.tips || '',
          ingredients: dish.ingredients || [],
          steps: dish.steps || []
        })
      }
    }
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  onDescriptionInput(event) {
    this.setData({ description: event.detail.value })
  },

  onCategoryChange(event) {
    const index = Number(event.detail.value)
    const option = this.data.categoryOptions[index]
    this.setData({ categoryIndex: index, categoryId: option.id })
  },

  onCookTimeInput(event) {
    this.setData({ cookTime: event.detail.value })
  },

  onServingsInput(event) {
    this.setData({ servings: event.detail.value })
  },

  onDifficultyChange(event) {
    this.setData({ difficulty: event.detail.value })
  },

  onTipsInput(event) {
    this.setData({ tips: event.detail.value })
  },

  addIngredient() {
    const ingredients = this.data.ingredients.concat({ id: generateId(), name: '', amount: '', unit: '', note: '' })
    this.setData({ ingredients })
  },

  updateIngredient(event) {
    const { index, field } = event.currentTarget.dataset
    const value = event.detail.value
    const ingredients = this.data.ingredients.slice()
    ingredients[index][field] = value
    this.setData({ ingredients })
  },

  removeIngredient(event) {
    const index = Number(event.currentTarget.dataset.index)
    const ingredients = this.data.ingredients.slice()
    ingredients.splice(index, 1)
    this.setData({ ingredients })
  },

  addStep() {
    const steps = this.data.steps.concat({ id: generateId(), order: this.data.steps.length + 1, content: '' })
    this.setData({ steps })
  },

  updateStep(event) {
    const { index, field } = event.currentTarget.dataset
    const value = event.detail.value
    const steps = this.data.steps.slice()
    steps[index][field] = value
    this.setData({ steps })
  },

  removeStep(event) {
    const index = Number(event.currentTarget.dataset.index)
    const steps = this.data.steps.slice()
    steps.splice(index, 1)
    this.setData({ steps })
  },

  moveStep(event) {
    const { index, direction } = event.currentTarget.dataset
    const steps = this.data.steps.slice()
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= steps.length) return
    const temp = steps[index]
    steps[index] = steps[target]
    steps[target] = temp
    steps.forEach((step, idx) => {
      step.order = idx + 1
    })
    this.setData({ steps })
  },

  saveDish() {
    const name = this.data.name.trim()
    const requiredError = validateRequired(name, '菜名')
    if (requiredError) {
      this.setData({ error: requiredError })
      return
    }
    const ingredientError = validateIngredients(this.data.ingredients)
    if (ingredientError) {
      this.setData({ error: ingredientError })
      return
    }
    const stepError = validateSteps(this.data.steps)
    if (stepError) {
      this.setData({ error: stepError })
      return
    }
    this.setData({ error: '' })

    const payload = {
      name,
      description: this.data.description,
      categoryId: this.data.categoryId || null,
      ingredients: this.data.ingredients,
      steps: this.data.steps,
      cookTime: this.data.cookTime ? Number(this.data.cookTime) : undefined,
      servings: this.data.servings ? Number(this.data.servings) : undefined,
      difficulty: this.data.difficulty || undefined,
      tips: this.data.tips
    }

    if (this.data.id) {
      updateDish(this.data.id, payload)
      wx.navigateBack()
      return
    }

    const dish = createDish(payload)
    wx.redirectTo({ url: `/pages/dish-detail/dish-detail?id=${dish.id}` })
  }
})
