import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Dish, Menu } from '../../models'
import { useDishStore } from '../../stores/dishStore'
import { useMenuStore } from '../../stores/menuStore'

export function MenuDetailPage() {
  const { menuId } = useParams()
  const { getById } = useMenuStore()
  const { dishes, load: loadDishes } = useDishStore()
  const [menu, setMenu] = useState<Menu | undefined>()

  useEffect(() => {
    if (!menuId) return
    void getById(menuId).then(setMenu)
  }, [menuId, getById])

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

  if (!menu) {
    return (
      <section className="page">
        <div className="page-header">
          <h1>菜单详情</h1>
          <p>未找到该菜单。</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>{menu.name}</h1>
        <p>查看菜品清单与顺序。</p>
        <div className="actions-inline">
          <Link className="ghost-button" to={`/menus/${menu.id}/edit`}>
            编辑
          </Link>
        </div>
      </div>

      <div className="card">
        {menu.items.length === 0 ? (
          <p className="muted">暂无菜品，请先在菜单中添加。</p>
        ) : (
          <ol className="list">
            {menu.items
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const dish = dishMap.get(item.dishId)
                return (
                  <li className="list-item" key={item.id}>
                    {dish ? (
                      <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
                    ) : (
                      <span>菜品已删除</span>
                    )}
                    {item.note ? `（${item.note}）` : ''}
                  </li>
                )
              })}
          </ol>
        )}
      </div>
    </section>
  )
}
