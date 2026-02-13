import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Dish, IngredientItem, StepItem } from '../../models'
import { useCategoryStore } from '../../stores/categoryStore'
import { useDishStore } from '../../stores/dishStore'
import { generateId } from '../../utils/id'

const difficultyOptions: Dish['difficulty'][] = ['easy', 'medium', 'hard']

export function DishEditPage() {
  const navigate = useNavigate()
  const { dishId } = useParams()
  const isNew = !dishId || dishId === 'new'
  const { categories, load: loadCategories } = useCategoryStore()
  const { getById, add, update } = useDishStore()

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [difficulty, setDifficulty] = useState<Dish['difficulty'] | ''>('')
  const [tips, setTips] = useState('')
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [steps, setSteps] = useState<StepItem[]>([])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (isNew || !dishId) return
    void getById(dishId).then((dish) => {
      if (!dish) return
      setName(dish.name)
      setCategoryId(dish.categoryId ?? null)
      setDescription(dish.description ?? '')
      setCookTime(dish.cookTime ? String(dish.cookTime) : '')
      setServings(dish.servings ? String(dish.servings) : '')
      setDifficulty(dish.difficulty ?? '')
      setTips(dish.tips ?? '')
      setIngredients(dish.ingredients)
      setSteps(dish.steps)
    })
  }, [dishId, getById, isNew])

  const sortedSteps = useMemo(
    () => steps.slice().sort((a, b) => a.order - b.order),
    [steps]
  )

  const handleSave = async () => {
    if (!name.trim()) return
    const payload = {
      name,
      categoryId,
      description,
      ingredients,
      steps,
      cookTime: cookTime ? Number(cookTime) : undefined,
      servings: servings ? Number(servings) : undefined,
      difficulty: difficulty || undefined,
      tips
    }
    if (isNew) {
      const dish = await add(payload)
      navigate(`/dishes/${dish.id}`)
      return
    }
    if (!dishId) return
    await update(dishId, payload)
    navigate(`/dishes/${dishId}`)
  }

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: generateId(), name: '', amount: undefined, unit: '', note: '' }
    ])
  }

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: generateId(), order: prev.length + 1, content: '' }
    ])
  }

  const moveStep = (id: string, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const sorted = prev.slice().sort((a, b) => a.order - b.order)
      const index = sorted.findIndex((item) => item.id === id)
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
        return prev
      }
      const newOrder = sorted.map((item) => ({ ...item }))
      const temp = newOrder[index].order
      newOrder[index].order = newOrder[targetIndex].order
      newOrder[targetIndex].order = temp
      return newOrder
    })
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>{isNew ? '新增菜品' : '编辑菜品'}</h1>
        <p>菜名必填，用料与步骤可排序。</p>
      </div>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <label className="field">
          <span>菜名</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="field">
          <span>分类</span>
          <select
            value={categoryId ?? ''}
            onChange={(event) => setCategoryId(event.target.value || null)}
          >
            <option value="">未分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>一句话简介</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>总时长（分钟）</span>
            <input
              type="number"
              min={0}
              value={cookTime}
              onChange={(event) => setCookTime(event.target.value)}
            />
          </label>
          <label className="field">
            <span>份量</span>
            <input
              type="number"
              min={0}
              value={servings}
              onChange={(event) => setServings(event.target.value)}
            />
          </label>
          <label className="field">
            <span>难度</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Dish['difficulty'])}>
              <option value="">未设置</option>
              {difficultyOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="card">
          <div className="section-header">
            <h3>用料</h3>
            <button className="ghost-button" type="button" onClick={addIngredient}>
              添加用料
            </button>
          </div>
          {ingredients.length === 0 && <p className="muted">暂无用料</p>}
          {ingredients.map((item, index) => (
            <div className="inline-grid" key={item.id}>
              <input
                placeholder="名称"
                value={item.name}
                onChange={(event) => {
                  const value = event.target.value
                  setIngredients((prev) =>
                    prev.map((ing, idx) => (idx === index ? { ...ing, name: value } : ing))
                  )
                }}
              />
              <input
                placeholder="用量"
                value={item.amount ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setIngredients((prev) =>
                    prev.map((ing, idx) =>
                      idx === index ? { ...ing, amount: value ? Number(value) : undefined } : ing
                    )
                  )
                }}
              />
              <input
                placeholder="单位"
                value={item.unit ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setIngredients((prev) =>
                    prev.map((ing, idx) => (idx === index ? { ...ing, unit: value } : ing))
                  )
                }}
              />
              <input
                placeholder="备注"
                value={item.note ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setIngredients((prev) =>
                    prev.map((ing, idx) => (idx === index ? { ...ing, note: value } : ing))
                  )
                }}
              />
              <button
                className="ghost-button danger"
                type="button"
                onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== index))}
              >
                删除
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-header">
            <h3>步骤</h3>
            <button className="ghost-button" type="button" onClick={addStep}>
              添加步骤
            </button>
          </div>
          {sortedSteps.length === 0 && <p className="muted">暂无步骤</p>}
          {sortedSteps.map((step, index) => (
            <div className="step-row" key={step.id}>
              <span className="step-index">{index + 1}</span>
              <input
                placeholder="步骤内容"
                value={step.content}
                onChange={(event) => {
                  const value = event.target.value
                  setSteps((prev) =>
                    prev.map((item) => (item.id === step.id ? { ...item, content: value } : item))
                  )
                }}
              />
              <input
                placeholder="计时(分钟)"
                value={step.timerMinutes ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setSteps((prev) =>
                    prev.map((item) =>
                      item.id === step.id
                        ? { ...item, timerMinutes: value ? Number(value) : undefined }
                        : item
                    )
                  )
                }}
              />
              <button className="ghost-button" type="button" onClick={() => moveStep(step.id, 'up')}>
                上移
              </button>
              <button className="ghost-button" type="button" onClick={() => moveStep(step.id, 'down')}>
                下移
              </button>
              <button
                className="ghost-button danger"
                type="button"
                onClick={() => setSteps((prev) => prev.filter((item) => item.id !== step.id))}
              >
                删除
              </button>
            </div>
          ))}
        </div>

        <label className="field">
          <span>要点/踩坑</span>
          <textarea value={tips} onChange={(event) => setTips(event.target.value)} rows={3} />
        </label>

        <button className="primary-button" type="submit">
          保存
        </button>
      </form>
    </section>
  )
}
