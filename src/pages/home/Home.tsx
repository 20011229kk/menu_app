export function HomePage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>首页</h1>
        <p>分类概览与最近更新视图。</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>按分类</h3>
          <p>查看各分类下的菜品与数量。</p>
          <button className="ghost-button" type="button">
            进入分类视图
          </button>
        </div>
        <div className="card">
          <h3>最近更新</h3>
          <p>快速找回刚编辑过的菜谱。</p>
          <button className="ghost-button" type="button">
            查看更新
          </button>
        </div>
      </div>
    </section>
  )
}
