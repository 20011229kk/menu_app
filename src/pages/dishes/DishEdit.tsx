export function DishEditPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1>编辑菜品</h1>
        <p>菜名必填，用料与步骤可排序。</p>
      </div>

      <form className="form">
        <label className="field">
          <span>菜名</span>
          <input placeholder="例如：宫保鸡丁" required />
        </label>
        <label className="field">
          <span>分类</span>
          <select>
            <option>未分类</option>
            <option>热菜</option>
          </select>
        </label>
        <label className="field">
          <span>一句话简介</span>
          <input placeholder="例如：酸甜微辣" />
        </label>
        <button className="primary-button" type="button">
          保存
        </button>
      </form>
    </section>
  )
}
