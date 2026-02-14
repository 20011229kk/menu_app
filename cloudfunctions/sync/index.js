const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function upsertCollection(collection, coupleId, items) {
  for (const item of items) {
    const id = item.id
    if (!id) continue
    const existing = await db.collection(collection).where({ coupleId, id }).get()
    if (existing.data.length === 0) {
      await db.collection(collection).add({ data: { ...item, coupleId } })
      continue
    }
    const current = existing.data[0]
    if (!current.updatedAt || String(item.updatedAt) > String(current.updatedAt)) {
      await db.collection(collection).doc(current._id).update({ data: { ...item, coupleId } })
    }
  }
}

async function pullUpdates(collection, coupleId, since) {
  const res = await db.collection(collection).where({
    coupleId,
    updatedAt: db.command.gt(since || '')
  }).get()
  return res.data.map((item) => {
    const { _id, coupleId: _, ...rest } = item
    return rest
  })
}

async function upsertGallery(coupleId, gallery) {
  if (!gallery || !gallery.updatedAt) return
  const doc = await db.collection('couples').doc(coupleId).get()
  const current = doc.data || {}
  if (!current.galleryImageUpdatedAt || String(gallery.updatedAt) > String(current.galleryImageUpdatedAt)) {
    await db.collection('couples').doc(coupleId).update({
      data: {
        galleryImageFileId: gallery.fileId || '',
        galleryImageUpdatedAt: gallery.updatedAt || new Date().toISOString()
      }
    })
  }
}

exports.main = async (event, context) => {
  const coupleId = event.coupleId
  if (!coupleId) {
    return { ok: false, message: '缺少共享空间' }
  }

  const payload = event.payload || {}
  const categories = payload.categories || []
  const dishes = payload.dishes || []
  const menus = payload.menus || []
  const gallery = payload.gallery || null

  await upsertCollection('categories', coupleId, categories)
  await upsertCollection('dishes', coupleId, dishes)
  await upsertCollection('menus', coupleId, menus)
  await upsertGallery(coupleId, gallery)

  const since = event.lastSync || ''
  const [remoteCategories, remoteDishes, remoteMenus] = await Promise.all([
    pullUpdates('categories', coupleId, since),
    pullUpdates('dishes', coupleId, since),
    pullUpdates('menus', coupleId, since)
  ])
  let galleryMeta = null
  try {
    const coupleDoc = await db.collection('couples').doc(coupleId).get()
    if (coupleDoc && coupleDoc.data) {
      galleryMeta = {
        fileId: coupleDoc.data.galleryImageFileId || '',
        updatedAt: coupleDoc.data.galleryImageUpdatedAt || ''
      }
    }
  } catch (error) {
    // ignore gallery read failure
  }

  return {
    ok: true,
    categories: remoteCategories,
    dishes: remoteDishes,
    menus: remoteMenus,
    gallery: galleryMeta,
    serverTime: new Date().toISOString()
  }
}
