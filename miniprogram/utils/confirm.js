function confirmDelete(content) {
  return new Promise((resolve) => {
    wx.showModal({
      title: '确认删除',
      content: content || '删除后可撤销',
      success: (res) => resolve(!!res.confirm)
    })
  })
}

module.exports = {
  confirmDelete
}
