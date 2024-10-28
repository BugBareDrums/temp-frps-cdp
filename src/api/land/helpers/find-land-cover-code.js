const deepSearchPruneUpwards = (data, value) =>
  data.flatMap((item) => {
    if (item.code === value) return [{ ...item }]

    const nestedKeys = ['classes', 'covers', 'uses']
    for (const nestedKey of nestedKeys) {
      if (item[nestedKey]) {
        const result = deepSearchPruneUpwards(item[nestedKey], value)
        if (result.length) return [{ ...item, [nestedKey]: result }]
      }
    }
    return []
  })

/**
 * Finds and returns land cover for a single land parcel from ArcGIS.
 * @param { import('mongodb').Db } db
 * @param { string } landCoverCode
 * @returns {Promise<{}|null>}
 */
async function findLandCoverCode(db, landCoverCode) {
  const result = db.collection('land-codes').find(
    {
      $or: [
        { code: landCoverCode.toString() },
        { 'classes.code': landCoverCode.toString() },
        { 'classes.covers.code': landCoverCode.toString() },
        { 'classes.covers.uses.code': landCoverCode.toString() }
      ]
    },
    { projection: { _id: 0 } }
  )

  const resultArray = await result.toArray()
  return deepSearchPruneUpwards(resultArray, landCoverCode)
}

export { findLandCoverCode }
