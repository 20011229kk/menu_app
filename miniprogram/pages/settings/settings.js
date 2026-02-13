const { exportJson } = require('../../services/exportService')
const { importJson } = require('../../services/importService')
const { emit } = require('../../utils/events')
const { showError } = require('../../utils/errors')
const { chooseSingleImage, saveImage } = require('../../utils/files')

Page({
  data: {
    importResult: '',
    galleryImage: ''
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
          content: '是否保存到手机或分享？',
          confirmText: '去保存',
          cancelText: '稍后',
          success: (res) => {
            if (!res.confirm) return
            wx.openDocument({
              filePath: path,
              showMenu: true
            })
          }
        })
      },
      fail: (error) => {
        showError(error, '导出失败')
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
              emit('data:changed')
              wx.showToast({ title: '导入成功', icon: 'success' })
            } catch (error) {
              showError(error, '导入失败')
            }
          },
          fail: (error) => {
            showError(error, '读取文件失败')
          }
        })
      }
    })
  },

  async chooseGalleryImage() {
    try {
      const tempPath = await chooseSingleImage()
      const savedPath = await saveImage(tempPath)
      this.setData({ galleryImage: savedPath })
    } catch (error) {
      showError(error, '选择图片失败')
    }
  },

  removeGalleryImage() {
    this.setData({ galleryImage: '' })
  }
})
