const { createDish, updateDish, listDishes } = require('../../services/dishService')
const { listCategories } = require('../../services/categoryService')
const { generateId } = require('../../utils/id')
const { validateRequired, validateIngredients, validateSteps } = require('../../utils/validation')
const { on, off } = require('../../utils/events')
const { chooseSingleImage, saveImage } = require('../../utils/files')
const { uploadImage, getTempUrl } = require('../../utils/cloudFile')
const { getSyncEnabled, getCoupleId } = require('../../utils/sync')
const { showError } = require('../../utils/errors')

Page({
  data: {
    id: '',
    name: '',
    description: '',
    coverImage: '',
    coverImageFileId: '',
    categoryId: '',
    categoryOptions: [],
    categoryIndex: 0,
    cookTime: '',
    servings: '',
    difficulty: '',
    difficultyOptions: ['简单', '中等', '困难'],
    difficultyIndex: 0,
    tips: '',
    ingredients: [],
    steps: [],
    ingredientsText: '',
    stepsText: '',
    error: ''
  },

  onLoad(query) {
    this._dishId = query.id || ''
    this._coverChanged = false
    this._originalCoverImage = ''
    this._originalCoverImageFileId = ''
    this._dataChangedHandler = () => this.refreshData()
    on('data:changed', this._dataChangedHandler)
    this.refreshData()
  },

  onUnload() {
    if (this._dataChangedHandler) {
      off('data:changed', this._dataChangedHandler)
    }
  },

  async refreshData() {
    const categories = listCategories().sort((a, b) => a.order - b.order)
    const categoryOptions = [{ id: '', name: '请选择分类' }, ...categories]
    this.setData({ categoryOptions })

    if (this._dishId) {
      const dish = listDishes().find((item) => item.id === this._dishId)
      if (dish) {
        const index = categoryOptions.findIndex((item) => item.id === (dish.categoryId || ''))
        const difficultyIndex = this.data.difficultyOptions.indexOf(dish.difficulty || '')
        let coverImage = dish.coverImage || ''
        const coverImageFileId = dish.coverImageFileId || ''
        if (coverImageFileId) {
          const url = await getTempUrl(coverImageFileId)
          if (url) coverImage = url
        }
        this._coverChanged = false
        this._originalCoverImage = dish.coverImage || ''
        this._originalCoverImageFileId = dish.coverImageFileId || ''
        this.setData({
          id: dish.id,
          name: dish.name,
          description: dish.description || '',
          coverImage,
          coverImageFileId,
          categoryId: dish.categoryId || '',
          categoryIndex: index >= 0 ? index : 0,
          cookTime: dish.cookTime || '',
          servings: dish.servings || '',
          difficulty: dish.difficulty || '',
          difficultyIndex: difficultyIndex >= 0 ? difficultyIndex : 0,
          tips: dish.tips || '',
          ingredients: dish.ingredients || [],
          steps: dish.steps || [],
          ingredientsText: this.serializeIngredients(dish.ingredients || []),
          stepsText: this.serializeSteps(dish.steps || [])
        })
      }
    }
  },

  onNameInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ name: value })
  },

  onDescriptionInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ description: value })
  },

  async chooseCoverImage() {
    try {
      const tempPath = await chooseSingleImage()
      let fileId = ''
      if (getSyncEnabled() && getCoupleId()) {
        fileId = await uploadImage(tempPath, getCoupleId(), 'dish-covers')
      }
      const savedPath = await saveImage(tempPath)
      this._coverChanged = true
      this.setData({ coverImage: savedPath, coverImageFileId: fileId })
    } catch (error) {
      showError(error, '选择图片失败')
    }
  },

  removeCoverImage() {
    this._coverChanged = true
    this.setData({ coverImage: '', coverImageFileId: '' })
  },

  onCategoryChange(event) {
    const index = Number(event.detail.value)
    const option = this.data.categoryOptions[index]
    this.setData({ categoryIndex: index, categoryId: option.id })
  },

  onCookTimeInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ cookTime: value })
  },

  onServingsInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ servings: value })
  },

  onDifficultyChange(event) {
    const index = Number(event.detail.value)
    const label = this.data.difficultyOptions[index]
    this.setData({ difficulty: label, difficultyIndex: index })
  },

  onTipsInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ tips: value })
  },

  onIngredientsInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ ingredientsText: value })
  },

  onStepsInput(event) {
    const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.detail
    this.setData({ stepsText: value })
  },

  serializeIngredients(ingredients) {
    return (ingredients || [])
      .map((item) => {
        const amountPart = item.amount ? `${item.amount}${item.unit || ''}` : ''
        const notePart = item.note ? `(${item.note})` : ''
        return [item.name, amountPart, notePart].filter(Boolean).join(' ').trim()
      })
      .filter(Boolean)
      .join('\n')
  },

  serializeSteps(steps) {
    return (steps || [])
      .map((item, index) => {
        const order = item.order || index + 1
        const content = item.content || ''
        return content ? `${order}. ${content}` : ''
      })
      .filter(Boolean)
      .join('\n')
  },

  parseIngredientsText(text) {
    const lines = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    return lines.map((line) => ({ id: generateId(), name: line, amount: '', unit: '', note: '' }))
  },

  parseStepsText(text) {
    const lines = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    return lines.map((line, index) => ({
      id: generateId(),
      order: index + 1,
      content: line.replace(/^\\s*\\d+[\\.、\\)]\\s*/, '')
    }))
  },

  saveDish() {
    const name = this.data.name.trim()
    const requiredError = validateRequired(name, '菜名')
    if (requiredError) {
      this.setData({ error: requiredError })
      showError(null, requiredError)
      return
    }
    if (!this.data.categoryId) {
      const message = '请选择分类'
      this.setData({ error: message })
      showError(null, message)
      return
    }
    const ingredientError = validateIngredients(this.data.ingredientsText)
    if (ingredientError) {
      this.setData({ error: ingredientError })
      showError(null, ingredientError)
      return
    }
    const stepError = validateSteps(this.data.stepsText)
    if (stepError) {
      this.setData({ error: stepError })
      showError(null, stepError)
      return
    }
    this.setData({ error: '' })

    const coverImage = this._coverChanged || !this.data.id ? this.data.coverImage : this._originalCoverImage
    const coverImageFileId =
      this._coverChanged || !this.data.id ? this.data.coverImageFileId : this._originalCoverImageFileId
    const ingredients = this.parseIngredientsText(this.data.ingredientsText)
    const steps = this.parseStepsText(this.data.stepsText)
    const payload = {
      name,
      description: this.data.description,
      coverImage,
      coverImageFileId,
      categoryId: this.data.categoryId || null,
      ingredients,
      steps,
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
