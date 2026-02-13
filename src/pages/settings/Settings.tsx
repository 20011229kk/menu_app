export function SettingsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>设置</h1>
        <p>导出数据与应用信息。</p>
      </div>

      <div className="card">
        <h3>数据导出</h3>
        <p>导出为 JSON 文件用于备份。</p>
        <button className="primary-button" type="button">
          导出 JSON
        </button>
      </div>
    </section>
  )
}
