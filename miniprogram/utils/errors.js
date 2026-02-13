function showError(error, fallback) {
  const message = error && error.message ? error.message : fallback || '操作失败'
  wx.showToast({ title: message, icon: 'none' })
}

function withErrorHandling(fn, fallback) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      showError(error, fallback)
    }
  }
}

module.exports = {
  showError,
  withErrorHandling
}
