import { arcgisTokenCache } from '~/src/helpers/arcgis-token/index.js'

/**
 * Finds and returns a single land parcel from ArcGIS.
 * @param { import('@hapi/hapi').Server } server
 * @param { string } landParcelId
 * @returns {Promise<{}|null>}
 */
async function findLandParcel(server, landParcelId) {
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/LMS_reference_parcels/FeatureServer/0/query?'
  )

  const { access_token: accessToken } =
    await arcgisTokenCache(server).get('arcgis_token')
  url.searchParams.set('token', accessToken)
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('resultRecordCount', '10')
  url.searchParams.set('outFields', '*')
  url.searchParams.set('where', `PARCEL_ID='${landParcelId}'`)

  /** @type { Response } */
  const response = await fetch(url)
  return await response.json()
}

export { findLandParcel }
