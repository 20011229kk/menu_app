import { useState } from 'react'
import { downloadJson } from '../../services/exportService'

export function SettingsPage() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await downloadJson()
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>设置</h1>
        <p>导出数据与应用信息。</p>
      </div>

      <div className="card">
        <h3>数据导出</h3>
        <p>导出为 JSON 文件用于备份。</p>
        <button className="primary-button" type="button" onClick={() => void handleExport()} disabled={exporting}>
          {exporting ? '导出中...' : '导出 JSON'}
        </button>
      </div>
    </section>
  )
}
