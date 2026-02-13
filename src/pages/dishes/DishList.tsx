export function DishListPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>菜品</h1>
        <p>按分类分组展示，支持搜索与排序切换。</p>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="搜索菜名/描述/用料" />
        <div className="segmented">
          <button className="segmented-button" type="button">
            名称排序
          </button>
          <button className="segmented-button" type="button">
            更新排序
          </button>
        </div>
      </div>

      <div className="card">
        <h3>热菜</h3>
        <ul className="list">
          <li className="list-item">宫保鸡丁</li>
          <li className="list-item">红烧排骨</li>
        </ul>
      </div>
    </section>
  )
}
