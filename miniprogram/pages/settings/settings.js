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
    syncStatus: '',
    shareExpanded: false
  },

  onLoad() {
    this._loadingCount = 0
  },

  startLoading(title) {
    this._loadingCount += 1
    if (this._loadingCount === 1) {
      wx.showNavigationBarLoading()
      if (title) {
        wx.showToast({ title, icon: 'loading', duration: 15000 })
      }
    }
  },

  stopLoading() {
    if (this._loadingCount <= 0) return
    this._loadingCount -= 1
    if (this._loadingCount === 0) {
      wx.hideNavigationBarLoading()
    }
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

  toggleSharePanel() {
    this.setData({ shareExpanded: !this.data.shareExpanded })
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
    this.startLoading('生成中...')
    try {
      if (!wx.cloud) {
        throw new Error('云开发未初始化')
      }
      const res = await createInvite()
      if (!res || !res.code) {
        throw new Error('生成邀请码失败')
      }
      this.setData({ inviteCode: res.code || '', coupleId: res.coupleId || '' })
      wx.showToast({ title: '邀请码已生成', icon: 'success' })
    } catch (error) {
      showError(error, '生成邀请码失败')
    } finally {
      this.stopLoading()
    }
  },

  async joinInviteCode() {
    const code = this.data.joinCode.trim().toUpperCase()
    if (!code) {
      showError(null, '请输入邀请码')
      return
    }
    this.startLoading('加入中...')
    try {
      const res = await joinInvite(code)
      if (!res.ok) {
        throw new Error(res.message || '加入失败')
      }
      this.setData({ coupleId: res.coupleId || '' })
      wx.showToast({ title: '已加入共享', icon: 'success' })
    } catch (error) {
      showError(error, '加入失败')
    } finally {
      this.stopLoading()
    }
  },

  async syncNow() {
    this.startLoading('同步中...')
    try {
      const res = await syncNow()
      if (res && res.ok) {
        emit('data:changed')
        this.setData({ syncStatus: `上次同步：${res.serverTime}` })
        wx.showToast({ title: '同步完成', icon: 'success' })
      } else if (res && res.message) {
        throw new Error(res.message)
      }
    } catch (error) {
      showError(error, '同步失败')
    } finally {
      this.stopLoading()
    }
  }
})
