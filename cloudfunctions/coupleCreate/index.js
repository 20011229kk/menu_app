const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const existing = await db.collection('couples').where({
    ownerOpenId: openid
  }).get()

  if (existing.data.length > 0) {
    return { coupleId: existing.data[0]._id, code: existing.data[0].code }
  }

  let code = generateCode()
  let tries = 0
  while (tries < 5) {
    const check = await db.collection('couples').where({ code }).get()
    if (check.data.length === 0) break
    code = generateCode()
    tries += 1
  }

  const res = await db.collection('couples').add({
    data: {
      code,
      ownerOpenId: openid,
      memberOpenId: '',
      createdAt: new Date().toISOString()
    }
  })

  return { coupleId: res._id, code }
}
