import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../App.css'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/categories', label: '分类' },
  { to: '/dishes', label: '菜品' },
  { to: '/menus', label: '菜单' },
  { to: '/settings', label: '设置' }
]

export function AppLayout() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">菜单/菜谱管理</div>
          <div className="app-subtitle">离线优先 · 轻量快捷</div>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => navigate('/dishes/new')}
        >
          新增
        </button>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="app-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-item${isActive ? ' nav-item-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
