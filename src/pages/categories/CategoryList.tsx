import { useEffect, useState } from 'react'
import { useCategoryStore } from '../../stores/categoryStore'

export function CategoryListPage() {
  const { categories, lastDeleted, load, add, rename, remove, move, undoDelete } = useCategoryStore()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    void load()
  }, [load])

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const saveEdit = async () => {
    if (!editingId) return
    await rename(editingId, editingName)
    setEditingId(null)
    setEditingName('')
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>分类</h1>
        <p>管理菜品分类并调整排序。</p>
      </div>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void add(name)
          setName('')
        }}
      >
        <label className="field">
          <span>新增分类</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：热菜"
          />
        </label>
        <button className="primary-button" type="submit">
          添加分类
        </button>
      </form>

      <div className="panel">
        {categories.length === 0 && <div className="empty">暂无分类</div>}
        {categories.map((category) => (
          <div className="panel-row" key={category.id}>
            {editingId === category.id ? (
              <input
                className="inline-input"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
              />
            ) : (
              <span>{category.name}</span>
            )}
            <div className="panel-actions">
              {editingId === category.id ? (
                <button className="ghost-button" type="button" onClick={() => void saveEdit()}>
                  保存
                </button>
              ) : (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => startEdit(category.id, category.name)}
                >
                  编辑
                </button>
              )}
              <button className="ghost-button" type="button" onClick={() => void move(category.id, 'up')}>
                上移
              </button>
              <button className="ghost-button" type="button" onClick={() => void move(category.id, 'down')}>
                下移
              </button>
              <button className="ghost-button danger" type="button" onClick={() => void remove(category.id)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {lastDeleted && (
        <div className="undo-bar">
          <span>已删除分类：{lastDeleted.name}</span>
          <button className="ghost-button" type="button" onClick={() => void undoDelete()}>
            撤销
          </button>
        </div>
      )}
    </section>
  )
}
