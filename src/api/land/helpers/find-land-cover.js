import { arcgisTokenCache } from '~/src/helpers/arcgis-token/index.js'

/**
 * Finds and returns land cover for a single land parcel from ArcGIS.
 * @param { import('@hapi/hapi').Server } server
 * @param { string } landParcelId
 * @returns {Promise<{}|null>}
 */
async function findLandCover(server, landParcelId) {
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Land_Covers/FeatureServer/0/query'
  )

  // eslint-disable-next-line camelcase
  const { access_token } = await arcgisTokenCache(server).get('arcgis_token')
  url.searchParams.set('token', access_token)
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('resultRecordCount', '10')
  url.searchParams.set('outFields', '*')
  url.searchParams.set('where', `PARCEL_ID='${landParcelId}'`)

  /** @type { Response } */
  const response = await fetch(url)
  return await response.json()
}

export { findLandCover }
