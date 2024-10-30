import fetch from 'node-fetch'
import { arcgisTokenCache } from '~/src/helpers/arcgis-token/index.js'
import { findLandCoverCode } from './find-land-cover-code.js'

/**
 * Finds and returns the latest land parcel from ArcGIS for each specified PARCEL_ID.
 * @param { import('@hapi/hapi').Request & MongoDBPlugin  } request
 * @param { string } sbi
 * @returns {Promise<Array<{}>>}
 */
async function findLandParcelsBySbi({ server, db }, sbi) {
  // eslint-disable-next-line camelcase
  const { access_token } = await arcgisTokenCache(server).get('arcgis_token')

  // look up SBI in mongo to return a business
  const results = db.collection('farmers').find({ 'companies.sbi': sbi })
  const user = await results.toArray()
  const company = user[0].companies.filter((company) => company.sbi === sbi)

  // Get the parcels
  const parcels = company[0].parcels
  const parcelIds = parcels.map((parcel) => parcel.id)

  // Create a single query URL
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/LMS_reference_parcels/FeatureServer/0/query?'
  )
  url.searchParams.set('token', access_token)
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('resultRecordCount', '1') // Set higher limit to capture potential duplicates
  url.searchParams.set('outFields', '*')
  url.searchParams.set('where', `PARCEL_ID IN (${parcelIds.toString()})`)
  url.searchParams.set('orderByFields', 'LAST_REFRESH_DATE DESC') // Order by latest date first

  const response = await fetch(url)
  const data = await response.json()

  const classCode = await getLandCoverClassCode(
    access_token,
    // @ts-expect-error this is demo data so it doesn't really matter
    data.features[0].properties.PARCEL_ID
  )

  const classCodeInfo = await findLandCoverCode(db, classCode)

  return transformParcelData(sbi, parcels, classCodeInfo, {
    // @ts-expect-error this is demo data so it doesn't really matter
    entity: { features: data.features }
  })
}

/**
 * Transforms the parcel data from ArcGIS format to a simplified format.
 * @param {string} sbi - JSON data with `features` array inside `entity`.
 * @param {Array} parcels - JSON data with `features` array inside `entity`.
 * @param {object} classCodeInfo - JSON data with `features` array inside `entity`.
 * @param {object} json - JSON data with `features` array inside `entity`.
 * @returns {Array} Transformed data for each parcel.
 */
function transformParcelData(sbi, parcels, classCodeInfo, json) {
  return json.entity.features.map((feature) => {
    const properties = feature.properties
    const { attributes, agreements } = parcels.find(
      (parcel) => parcel.id === properties.PARCEL_ID
    )

    return {
      id: properties.id,
      sbi,
      parcelId: properties.PARCEL_ID,
      area: (properties.GEOM_AREA_SQM / 10000).toFixed(4), // Convert to hectares
      osSheetId: properties.SHEET_ID,
      validFrom: properties.VALID_FROM,
      validTo: properties.VALID_TO,
      verifiedOn: properties.VERIFIED_ON,
      verificationType: properties.VERIFICATION_TYPE,
      createdOn: properties.CREATED_ON,
      createdBy: properties.CREATED_BY,
      validated: properties.VALIDATED,
      centroidX: properties.CENTROID_X,
      centroidY: properties.CENTROID_Y,
      lastRefreshDate: properties.LAST_REFRESH_DATE,
      wktFormatGeometry: properties.F_geometrywkt,
      shapeArea: properties.Shape__Area,
      shapeLength: properties.Shape__Length,
      landCovers: classCodeInfo,
      agreements,
      landUseList: [],
      attributes
    }
  })
}

async function getLandCoverClassCode(accessToken, parcelId) {
  // Construct the query URL for ArcGIS
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Land_Covers/FeatureServer/0/query?'
  )
  url.searchParams.set('where', `PARCEL_ID='${parcelId}'`)
  url.searchParams.set('outFields', 'LAND_COVER_CLASS_CODE')
  url.searchParams.set('resultRecordCount', '1')
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('token', accessToken)

  const response = await fetch(url)
  const data = await response.json()

  // Extract and return the LAND_COVER_CLASS_CODE if it exists
  const landCoverClassCode =
    // @ts-expect-error this is demo data so it doesn't really matter for now
    data.features?.[0]?.properties?.LAND_COVER_CLASS_CODE || null
  return landCoverClassCode
}

export { findLandParcelsBySbi }

/** @import { MongoDBPlugin } from '~/src/helpers/mongodb.js' */
