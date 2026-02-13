import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Dish, Menu, MenuItem } from '../../models'
import { useDishStore } from '../../stores/dishStore'
import { useMenuStore } from '../../stores/menuStore'
import { generateId } from '../../utils/id'
import { validateMenuName } from '../../utils/validation'

export function MenuEditPage() {
  const { menuId } = useParams()
  const navigate = useNavigate()
  const { menus, getById, update, setItems, load: loadMenus } = useMenuStore()
  const { dishes, load: loadDishes } = useDishStore()
  const [menu, setMenu] = useState<Menu | undefined>()
  const [name, setName] = useState('')
  const [items, setItemsState] = useState<MenuItem[]>([])
  const [selectedDishId, setSelectedDishId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!menuId) return
    void getById(menuId).then((result) => {
      if (!result) return
      setMenu(result)
      setName(result.name)
      setItemsState(result.items)
    })
  }, [menuId, getById])

  useEffect(() => {
    void loadMenus()
  }, [loadMenus])

  useEffect(() => {
    void loadDishes()
  }, [loadDishes])

  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>()
    for (const dish of dishes) {
      map.set(dish.id, dish)
    }
    return map
  }, [dishes])

  const saveMenu = async () => {
    if (!menuId) return
    const message = validateMenuName(name, menus, menuId)
    if (message) {
      setError(message)
      return
    }
    setError(null)
    const updated = await update(menuId, { name })
    await setItems(menuId, items)
    setMenu(updated)
    navigate(`/menus/${menuId}`)
  }

  const addDish = () => {
    if (!selectedDishId) return
    const maxOrder = items.reduce((max, item) => Math.max(max, item.order), 0)
    setItemsState((prev) => [
      ...prev,
      { id: generateId(), dishId: selectedDishId, order: maxOrder + 1 }
    ])
    setSelectedDishId('')
  }

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setItemsState((prev) => {
      const sorted = prev.slice().sort((a, b) => a.order - b.order)
      const index = sorted.findIndex((item) => item.id === id)
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
        return prev
      }
      const updated = sorted.map((item) => ({ ...item }))
      const temp = updated[index].order
      updated[index].order = updated[targetIndex].order
      updated[targetIndex].order = temp
      return updated
    })
  }

  const updateNote = (id: string, note: string) => {
    setItemsState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    )
  }

  const removeItem = (id: string) => {
    setItemsState((prev) => prev.filter((item) => item.id !== id))
  }

  if (!menuId) {
    return (
      <section className="page">
        <div className="page-header">
          <h1>编辑菜单</h1>
          <p>菜单不存在。</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>编辑菜单</h1>
        <p>从菜品库中选择并排序。</p>
      </div>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void saveMenu()
        }}
      >
        <label className="field">
          <span>菜单名称</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <div className="field">
          <span>添加菜品</span>
          <div className="inline-actions">
            <select value={selectedDishId} onChange={(event) => setSelectedDishId(event.target.value)}>
              <option value="">选择菜品</option>
              {dishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
            <button className="ghost-button" type="button" onClick={addDish}>
              添加
            </button>
          </div>
        </div>

        <div className="panel">
          {items.length === 0 && <div className="empty">暂无菜品</div>}
          {items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const dish = dishMap.get(item.dishId)
              return (
                <div className="panel-row" key={item.id}>
                  <span>{dish ? dish.name : '菜品已删除'}</span>
                  <div className="panel-actions">
                    <input
                      className="inline-input"
                      placeholder="备注"
                      value={item.note ?? ''}
                      onChange={(event) => updateNote(item.id, event.target.value)}
                    />
                    <button className="ghost-button" type="button" onClick={() => moveItem(item.id, 'up')}>
                      上移
                    </button>
                    <button className="ghost-button" type="button" onClick={() => moveItem(item.id, 'down')}>
                      下移
                    </button>
                    <button className="ghost-button danger" type="button" onClick={() => removeItem(item.id)}>
                      删除
                    </button>
                  </div>
                </div>
              )
            })}
        </div>

        <button className="primary-button" type="submit">
          保存菜单
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  )
}
