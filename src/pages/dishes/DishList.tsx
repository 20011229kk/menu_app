import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCategoryStore } from '../../stores/categoryStore'
import { useDishStore } from '../../stores/dishStore'
import { matchesDish } from '../../utils/search'
import { sortCategories } from '../../utils/sort'

export function DishListPage() {
  const navigate = useNavigate()
  const { categories, load: loadCategories } = useCategoryStore()
  const { dishes, load: loadDishes, sorted } = useDishStore()
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<'name' | 'updatedAt'>('name')

  useEffect(() => {
    void loadCategories()
    void loadDishes()
  }, [loadCategories, loadDishes])

  const grouped = useMemo(() => {
    const filtered = dishes.filter((dish) => matchesDish(dish, query))
    const categoryMap = new Map<string, string>()
    for (const category of categories) {
      categoryMap.set(category.id, category.name)
    }
    const buckets = new Map<string, typeof filtered>()
    for (const dish of filtered) {
      const key = dish.categoryId ?? 'uncategorized'
      const list = buckets.get(key) ?? []
      list.push(dish)
      buckets.set(key, list)
    }
    return { buckets, categoryMap }
  }, [categories, dishes, query])

  const sortedCategories = sortCategories(categories, 'order')

  return (
    <section className="page">
      <div className="page-header">
        <h1>菜品</h1>
        <p>按分类分组展示，支持搜索与排序切换。</p>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="搜索菜名/描述/用料"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="segmented">
          <button
            className={`segmented-button${sortMode === 'name' ? ' segmented-active' : ''}`}
            type="button"
            onClick={() => setSortMode('name')}
          >
            名称排序
          </button>
          <button
            className={`segmented-button${sortMode === 'updatedAt' ? ' segmented-active' : ''}`}
            type="button"
            onClick={() => setSortMode('updatedAt')}
          >
            更新排序
          </button>
        </div>
        <button className="primary-button" type="button" onClick={() => navigate('/dishes/new')}>
          新增菜品
        </button>
      </div>

      {sortedCategories.map((category) => {
        const list = grouped.buckets.get(category.id) ?? []
        if (list.length === 0) return null
        return (
          <div className="card" key={category.id}>
            <h3>{category.name}</h3>
            <ul className="list">
              {sorted(sortMode)
                .filter((dish) => dish.categoryId === category.id)
                .filter((dish) => matchesDish(dish, query))
                .map((dish) => (
                  <li className="list-item" key={dish.id}>
                    <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
                  </li>
                ))}
            </ul>
          </div>
        )
      })}

      <div className="card">
        <h3>未分类</h3>
        <ul className="list">
          {sorted(sortMode)
            .filter((dish) => !dish.categoryId)
            .filter((dish) => matchesDish(dish, query))
            .map((dish) => (
              <li className="list-item" key={dish.id}>
                <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
              </li>
            ))}
        </ul>
      </div>
    </section>
  )
}
