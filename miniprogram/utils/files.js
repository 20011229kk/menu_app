function chooseSingleImage() {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (!path) {
          reject(new Error('未选择图片'))
          return
        }
        resolve(path)
      },
      fail: (error) => reject(error)
    })
  })
}

function saveImage(tempPath) {
  return new Promise((resolve, reject) => {
    wx.saveFile({
      tempFilePath: tempPath,
      success: (res) => resolve(res.savedFilePath),
      fail: (error) => reject(error)
    })
  })
}

module.exports = {
  chooseSingleImage,
  saveImage
}
