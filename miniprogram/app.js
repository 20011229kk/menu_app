const { repairData } = require('./utils/repair')
const { initCloud } = require('./utils/sync')

App({
  globalData: {
    version: '0.1.0'
  },
  onLaunch() {
    initCloud()
    try {
      repairData()
    } catch (error) {
      // ignore repair failures to avoid blocking app start
    }
  }
})
