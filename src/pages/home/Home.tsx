import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategoryStore } from '../../stores/categoryStore'
import { useDishStore } from '../../stores/dishStore'
import { sortCategories, sortDishes } from '../../utils/sort'

type ViewMode = 'category' | 'recent'

export function HomePage() {
  const { categories, load: loadCategories } = useCategoryStore()
  const { dishes, load: loadDishes } = useDishStore()
  const [view, setView] = useState<ViewMode>('category')

  useEffect(() => {
    void loadCategories()
    void loadDishes()
  }, [loadCategories, loadDishes])

  const sortedCategories = sortCategories(categories, 'order')

  const categorySummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const dish of dishes) {
      const key = dish.categoryId ?? 'uncategorized'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [dishes])

  const recentDishes = useMemo(() => sortDishes(dishes, 'updatedAt').slice(0, 6), [dishes])

  return (
    <section className="page">
      <div className="page-header">
        <h1>首页</h1>
        <p>分类概览与最近更新视图。</p>
      </div>

      <div className="segmented">
        <button
          className={`segmented-button${view === 'category' ? ' segmented-active' : ''}`}
          type="button"
          onClick={() => setView('category')}
        >
          按分类
        </button>
        <button
          className={`segmented-button${view === 'recent' ? ' segmented-active' : ''}`}
          type="button"
          onClick={() => setView('recent')}
        >
          最近更新
        </button>
      </div>

      {view === 'category' && (
        <div className="card-grid">
          {sortedCategories.map((category) => (
            <div className="card" key={category.id}>
              <div className="card-title">
                <h3>{category.name}</h3>
                <span className="muted">{categorySummary.get(category.id) ?? 0}</span>
              </div>
              <p>{categorySummary.get(category.id) ?? 0} 道菜</p>
              <Link className="ghost-button" to="/dishes">
                查看菜品
              </Link>
            </div>
          ))}
          <div className="card">
            <div className="card-title">
              <h3>未分类</h3>
              <span className="muted">{categorySummary.get('uncategorized') ?? 0}</span>
            </div>
            <p>{categorySummary.get('uncategorized') ?? 0} 道菜</p>
            <Link className="ghost-button" to="/dishes">
              查看菜品
            </Link>
          </div>
        </div>
      )}

      {view === 'recent' && (
        <div className="card-grid">
          {recentDishes.length === 0 && <div className="empty">暂无更新记录</div>}
          {recentDishes.map((dish) => (
            <div className="card" key={dish.id}>
              <h3>{dish.name}</h3>
              <p>{dish.description ?? '暂无简介'}</p>
              <Link className="ghost-button" to={`/dishes/${dish.id}`}>
                查看详情
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
