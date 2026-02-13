import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCategoryStore } from '../../stores/categoryStore'
import { useDishStore } from '../../stores/dishStore'
import { matchesDish } from '../../utils/search'
import { sortCategories, sortDishes } from '../../utils/sort'
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '../../utils/recentSearch'

export function DishListPage() {
  const navigate = useNavigate()
  const { categories, load: loadCategories } = useCategoryStore()
  const { dishes, lastDeleted, load: loadDishes, sorted, undoDelete } = useDishStore()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [sortMode, setSortMode] = useState<'name' | 'updatedAt'>('name')

  useEffect(() => {
    void loadCategories()
    void loadDishes()
  }, [loadCategories, loadDishes])

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  const filteredDishes = useMemo(() => {
    const filtered = dishes.filter((dish) => matchesDish(dish, query))
    if (selectedCategory === 'all') {
      return filtered
    }
    if (selectedCategory === 'uncategorized') {
      return filtered.filter((dish) => !dish.categoryId)
    }
    return filtered.filter((dish) => dish.categoryId === selectedCategory)
  }, [dishes, query, selectedCategory])

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
          onBlur={() => {
            if (!query.trim()) return
            setRecentSearches(addRecentSearch(query))
          }}
        />
        <select
          className="select-input"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="all">全部分类</option>
          {sortedCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value="uncategorized">未分类</option>
        </select>
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

      {filteredDishes.length === 0 && <div className="empty">暂无匹配菜品</div>}

      {recentSearches.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h3>最近搜索</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                clearRecentSearches()
                setRecentSearches([])
              }}
            >
              清空
            </button>
          </div>
          <div className="chip-row">
            {recentSearches.map((item) => (
              <button
                className="chip"
                type="button"
                key={item}
                onClick={() => setQuery(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCategory === 'all' && (
        <>
          {sortedCategories.map((category) => {
            const list = filteredDishes.filter((dish) => dish.categoryId === category.id)
            if (list.length === 0) return null
            return (
              <div className="card" key={category.id}>
                <h3>{category.name}</h3>
                <ul className="list">
                  {sortDishes(list, sortMode).map((dish) => (
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
              {sortDishes(
                filteredDishes.filter((dish) => !dish.categoryId),
                sortMode
              ).map((dish) => (
                <li className="list-item" key={dish.id}>
                  <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {selectedCategory !== 'all' && (
        <div className="card">
          <h3>
            {selectedCategory === 'uncategorized'
              ? '未分类'
              : sortedCategories.find((item) => item.id === selectedCategory)?.name ?? '分类'}
          </h3>
          <ul className="list">
            {sortDishes(filteredDishes, sortMode).map((dish) => (
              <li className="list-item" key={dish.id}>
                <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lastDeleted && (
        <div className="undo-bar">
          <span>已删除菜品：{lastDeleted.name}</span>
          <button className="ghost-button" type="button" onClick={() => void undoDelete()}>
            撤销
          </button>
        </div>
      )}
    </section>
  )
}
