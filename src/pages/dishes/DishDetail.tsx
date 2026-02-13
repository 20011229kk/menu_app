export function DishDetailPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>菜品详情</h1>
        <p>展示用料、步骤、要点。</p>
      </div>

      <div className="card">
        <h3>用料</h3>
        <ul className="list">
          <li className="list-item">鸡胸肉 300g</li>
          <li className="list-item">花生 30g</li>
        </ul>
      </div>

      <div className="card">
        <h3>步骤</h3>
        <ol className="list">
          <li className="list-item">切丁腌制。</li>
          <li className="list-item">下锅翻炒。</li>
        </ol>
      </div>
    </section>
  )
}
