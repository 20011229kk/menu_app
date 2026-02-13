const { repairData } = require('./utils/repair')

App({
  globalData: {
    version: '0.1.0'
  },
  onLaunch() {
    try {
      repairData()
    } catch (error) {
      // ignore repair failures to avoid blocking app start
    }
  }
})
