const { showError } = require('./errors')

function canUseCloud() {
  return !!wx.cloud
}

async function uploadImage(tempPath, coupleId, prefix) {
  if (!canUseCloud() || !coupleId) return ''
  const ext = tempPath.split('.').pop() || 'jpg'
  const cloudPath = `${prefix}/${coupleId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  try {
    const res = await wx.cloud.uploadFile({ cloudPath, filePath: tempPath })
    return res.fileID || ''
  } catch (error) {
    showError(error, '图片上传失败')
    return ''
  }
}

async function getTempUrl(fileId) {
  if (!canUseCloud() || !fileId) return ''
  try {
    const res = await wx.cloud.getTempFileURL({ fileList: [fileId] })
    const item = res.fileList && res.fileList[0]
    return item && item.tempFileURL ? item.tempFileURL : ''
  } catch (error) {
    showError(error, '图片加载失败')
    return ''
  }
}

module.exports = {
  uploadImage,
  getTempUrl
}
