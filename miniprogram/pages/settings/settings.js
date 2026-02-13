const { exportJson } = require('../../services/exportService')
const { importJson } = require('../../services/importService')
const { emit } = require('../../utils/events')
const { showError } = require('../../utils/errors')
const { chooseSingleImage, saveImage } = require('../../utils/files')
const {
  getSyncEnabled,
  setSyncEnabled,
  getCoupleId,
  getLastSync,
  createInvite,
  joinInvite,
  syncNow
} = require('../../utils/sync')

Page({
  data: {
    importResult: '',
    galleryImage: '',
    syncEnabled: false,
    coupleId: '',
    inviteCode: '',
    joinCode: '',
    syncStatus: ''
  },

  onShow() {
    const saved = wx.getStorageSync('menu_app_gallery_image')
    const syncEnabled = getSyncEnabled()
    const coupleId = getCoupleId()
    const lastSync = getLastSync()
    this.setData({
      galleryImage: saved || '',
      syncEnabled,
      coupleId: coupleId || '',
      syncStatus: lastSync ? `上次同步：${lastSync}` : ''
    })
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
            if (typeof wx.shareFileMessage === 'function') {
              wx.shareFileMessage({
                filePath: path,
                fileName: 'menu_app_export.json',
                success: () => {
                  wx.showToast({ title: '已唤起分享', icon: 'success' })
                },
                fail: (error) => {
                  showError(error, '分享失败')
                }
              })
              return
            }
            wx.openDocument({
              filePath: path,
              showMenu: true,
              fail: (error) => {
                showError(error, '无法打开文件')
              }
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
      wx.setStorageSync('menu_app_gallery_image', savedPath)
      this.setData({ galleryImage: savedPath })
    } catch (error) {
      showError(error, '选择图片失败')
    }
  },

  toggleSync(event) {
    const enabled = !!event.detail.value
    setSyncEnabled(enabled)
    this.setData({ syncEnabled: enabled })
  },

  onJoinInput(event) {
    this.setData({ joinCode: event.detail.value })
  },

  async createInviteCode() {
    try {
      const res = await createInvite()
      this.setData({ inviteCode: res.code || '', coupleId: res.coupleId || '' })
    } catch (error) {
      showError(error, '生成邀请码失败')
    }
  },

  async joinInviteCode() {
    const code = this.data.joinCode.trim().toUpperCase()
    if (!code) {
      showError(null, '请输入邀请码')
      return
    }
    try {
      const res = await joinInvite(code)
      if (!res.ok) {
        showError(null, res.message || '加入失败')
        return
      }
      this.setData({ coupleId: res.coupleId || '' })
      wx.showToast({ title: '已加入共享', icon: 'success' })
    } catch (error) {
      showError(error, '加入失败')
    }
  },

  async syncNow() {
    try {
      const res = await syncNow()
      if (res && res.ok) {
        emit('data:changed')
        this.setData({ syncStatus: `上次同步：${res.serverTime}` })
        wx.showToast({ title: '同步完成', icon: 'success' })
      } else if (res && res.message) {
        showError(null, res.message)
      }
    } catch (error) {
      showError(error, '同步失败')
    }
  }
})
