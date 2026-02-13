export function MenuEditPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>编辑菜单</h1>
        <p>从菜品库中选择并排序。</p>
      </div>

      <div className="panel">
        <div className="panel-row">
          <span>宫保鸡丁</span>
          <button className="ghost-button" type="button">
            备注
          </button>
        </div>
        <div className="panel-row">
          <span>清炒时蔬</span>
          <button className="ghost-button" type="button">
            备注
          </button>
        </div>
      </div>
    </section>
  )
}
