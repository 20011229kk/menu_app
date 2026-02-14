const { repairData } = require('./utils/repair')
const { initCloud, autoSyncIfEnabled } = require('./utils/sync')

App({
  globalData: {
    version: '0.1.0'
  },
  showSoftToast(message) {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    if (!page) {
      wx.showToast({ title: message, icon: 'none' })
      return
    }
    const token = Date.now()
    page.setData({ softToastVisible: true, softToastText: message, softToastToken: token })
    setTimeout(() => {
      const current = getCurrentPages().slice(-1)[0]
      if (current && current.data && current.data.softToastToken === token) {
        current.setData({ softToastVisible: false })
      }
    }, 1800)
  },
  onLaunch() {
    initCloud()
    try {
      repairData()
    } catch (error) {
      // ignore repair failures to avoid blocking app start
    }
    autoSyncIfEnabled()
  }
})
