import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Dish } from '../../models'
import { useDishStore } from '../../stores/dishStore'

export function DishDetailPage() {
  const { dishId } = useParams()
  const { getById } = useDishStore()
  const [dish, setDish] = useState<Dish | undefined>()

  useEffect(() => {
    if (!dishId) return
    void getById(dishId).then(setDish)
  }, [dishId, getById])

  if (!dish) {
    return (
      <section className="page">
        <div className="page-header">
          <h1>菜品详情</h1>
          <p>未找到该菜品。</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>{dish.name}</h1>
        <p>{dish.description ?? '暂无简介'}</p>
        <div className="actions-inline">
          <Link className="ghost-button" to={`/dishes/${dish.id}/edit`}>
            编辑
          </Link>
        </div>
      </div>

      <div className="card">
        <h3>用料</h3>
        {dish.ingredients.length === 0 ? (
          <p className="muted">暂无用料记录</p>
        ) : (
          <ul className="list">
            {dish.ingredients.map((item) => (
              <li className="list-item" key={item.id}>
                {item.name}
                {item.amount !== undefined ? ` ${item.amount}` : ''}
                {item.unit ?? ''}
                {item.note ? `（${item.note}）` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>步骤</h3>
        {dish.steps.length === 0 ? (
          <p className="muted">暂无步骤</p>
        ) : (
          <ol className="list">
            {dish.steps
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li className="list-item" key={step.id}>
                  {step.content}
                </li>
              ))}
          </ol>
        )}
      </div>

      {dish.tips && (
        <div className="card">
          <h3>要点</h3>
          <p>{dish.tips}</p>
        </div>
      )}
    </section>
  )
}
