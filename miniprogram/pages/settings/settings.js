const { exportJson } = require('../../services/exportService')
const { importJson } = require('../../services/importService')

Page({
  data: {
    importResult: ''
  },

  exportData() {
    const content = exportJson()
    const fs = wx.getFileSystemManager()
    const path = `${wx.env.USER_DATA_PATH}/menu_app_export.json`
    fs.writeFile({
      filePath: path,
      data: content,
      encoding: 'utf8',
      success: () => {
        wx.showModal({
          title: '导出完成',
          content: `文件已保存至: ${path}`,
          showCancel: false
        })
      },
      fail: () => {
        wx.showToast({ title: '导出失败', icon: 'none' })
      }
    })
  },

  importData() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const file = res.tempFiles[0]
        const fs = wx.getFileSystemManager()
        fs.readFile({
          filePath: file.path,
          encoding: 'utf8',
          success: (result) => {
            try {
              const stats = importJson(result.data)
              this.setData({
                importResult: `已导入：分类 ${stats.categories}，菜品 ${stats.dishes}，菜单 ${stats.menus}`
              })
              wx.showToast({ title: '导入成功', icon: 'success' })
            } catch (error) {
              const message = error && error.message ? error.message : '导入失败'
              wx.showToast({ title: message, icon: 'none' })
            }
          },
          fail: () => {
            wx.showToast({ title: '读取文件失败', icon: 'none' })
          }
        })
      }
    })
  }
})
