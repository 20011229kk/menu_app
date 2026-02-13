import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMenuStore } from '../../stores/menuStore'

export function MenuListPage() {
  const navigate = useNavigate()
  const { menus, lastDeleted, load, add, remove, undoDelete } = useMenuStore()
  const [name, setName] = useState('')

  useEffect(() => {
    void load()
  }, [load])

  const handleAdd = async () => {
    if (!name.trim()) return
    const menu = await add(name)
    setName('')
    navigate(`/menus/${menu.id}/edit`)
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>菜单</h1>
        <p>创建一组菜品并设置顺序。</p>
      </div>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleAdd()
        }}
      >
        <label className="field">
          <span>菜单名称</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：周末家宴" />
        </label>
        <button className="primary-button" type="submit">
          新增菜单
        </button>
      </form>

      <div className="card-grid">
        {menus.length === 0 && (
          <div className="empty-card">
            <h3>暂无菜单</h3>
            <p className="muted">可先创建一个“周末家宴”用于复用。</p>
          </div>
        )}
        {menus.map((menu) => (
          <div className="card" key={menu.id}>
            <h3>{menu.name}</h3>
            <p>{menu.items.length} 道菜</p>
            <div className="panel-actions">
              <Link className="ghost-button" to={`/menus/${menu.id}`}>
                查看详情
              </Link>
              <Link className="ghost-button" to={`/menus/${menu.id}/edit`}>
                编辑
              </Link>
              <button className="ghost-button danger" type="button" onClick={() => void remove(menu.id)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {lastDeleted && (
        <div className="undo-bar">
          <span>已删除菜单：{lastDeleted.name}</span>
          <button className="ghost-button" type="button" onClick={() => void undoDelete()}>
            撤销
          </button>
        </div>
      )}
    </section>
  )
}
