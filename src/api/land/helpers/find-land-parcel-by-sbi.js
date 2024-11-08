/**
 * @typedef Parcel
 * @property { string } id
 * @property { string } sheetId
 */

/**
 * Finds and returns the latest land parcel from ArcGIS for each specified PARCEL_ID.
 * @param { import('@hapi/hapi').Request & MongoDBPlugin  } request
 * @param { string } sbi
 * @returns {Promise<Array<Parcel>>}
 */
async function findLandParcelsBySbi({ db }, sbi) {
  const results = db.collection('farmers').find({ 'companies.sbi': sbi })
  const user = await results.toArray()
  const company = user[0].companies.filter((company) => company.sbi === sbi)

  // Get the parcels
  const parcels = company[0].parcels.map((parcel) => ({
    id: parcel.id,
    sheetId: parcel.sheetId,
    agreements: parcel.agreements,
    attributes: parcel.attributes
  }))

  return parcels
}

export { findLandParcelsBySbi }

/** @import { MongoDBPlugin } from '~/src/helpers/mongodb.js' */
