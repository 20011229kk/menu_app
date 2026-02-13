const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const code = String(event.code || '').toUpperCase().trim()
  if (!code) {
    return { ok: false, message: '邀请码不能为空' }
  }

  const res = await db.collection('couples').where({ code }).get()
  if (res.data.length === 0) {
    return { ok: false, message: '邀请码无效' }
  }

  const couple = res.data[0]
  if (couple.ownerOpenId === openid || couple.memberOpenId === openid) {
    return { ok: true, coupleId: couple._id }
  }

  if (couple.memberOpenId) {
    return { ok: false, message: '该邀请已被使用' }
  }

  await db.collection('couples').doc(couple._id).update({
    data: {
      memberOpenId: openid
    }
  })

  return { ok: true, coupleId: couple._id }
}
