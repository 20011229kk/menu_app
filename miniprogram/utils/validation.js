function validateRequired(name, label) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return `${label}不能为空`
  return null
}

function validateUnique(name, list, label, currentId) {
  const trimmed = String(name || '').trim()
  const exists = list.find((item) => item.name === trimmed && item.id !== currentId)
  if (exists) return `${label}已存在`
  return null
}

function validateIngredients(ingredients) {
  if ((ingredients || []).some((item) => !String(item.name || '').trim())) {
    return '用料名称不能为空'
  }
  return null
}

function validateSteps(steps) {
  if ((steps || []).some((item) => !String(item.content || '').trim())) {
    return '步骤内容不能为空'
  }
  return null
}

module.exports = {
  validateRequired,
  validateUnique,
  validateIngredients,
  validateSteps
}
