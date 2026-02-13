import { useState } from 'react'
import { downloadJson } from '../../services/exportService'
import { importJson } from '../../services/importService'

export function SettingsPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      await downloadJson()
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    setImportResult(null)
    try {
      const result = await importJson(file)
      setImportResult(`已导入：分类 ${result.categories}，菜品 ${result.dishes}，菜单 ${result.menus}`)
    } catch (error) {
      setImportResult(error instanceof Error ? error.message : '导入失败')
    } finally {
      setImporting(false)
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

      <div className="card">
        <h3>数据导入</h3>
        <p>从 JSON 备份恢复数据（将覆盖当前本地数据）。</p>
        <label className="upload">
          <input
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleImport(file)
              }
            }}
            disabled={importing}
          />
          <span className="ghost-button">{importing ? '导入中...' : '选择文件'}</span>
        </label>
        {importResult && <p className="muted">{importResult}</p>}
      </div>
    </section>
  )
}
