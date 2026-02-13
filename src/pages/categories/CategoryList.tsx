export function CategoryListPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>分类</h1>
        <p>管理菜品分类并调整排序。</p>
      </div>

      <div className="panel">
        <div className="panel-row">
          <span>热菜</span>
          <div className="panel-actions">
            <button className="ghost-button" type="button">
              上移
            </button>
            <button className="ghost-button" type="button">
              下移
            </button>
          </div>
        </div>
        <div className="panel-row">
          <span>凉菜</span>
          <div className="panel-actions">
            <button className="ghost-button" type="button">
              上移
            </button>
            <button className="ghost-button" type="button">
              下移
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
