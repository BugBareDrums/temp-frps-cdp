import { config } from '~/src/config/index.js'
import { initCache } from '~/src/helpers/cache.js'

/**
 * @type {Record<LayerId, string>}
 */
const baseUrls = {
  landParcel:
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/LMS_reference_parcels/FeatureServer',
  sssi: 'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Parcel_and_SSSI_intersects/FeatureServer',
  monuments: '',
  moorland: '',
  lfa: ''
}

/**
 * @param {import("@hapi/hapi").Server<any>} server
 * @param {{ layerId: LayerId; landParcelId?: string; outFields?: "*"; resultCount?: number; }} options
 */
async function constructArcGisUrl(server, options) {
  const { layerId, landParcelId, outFields = '*', resultCount } = options
  const layer = baseUrls[layerId]

  if (!layer) {
    throw new Error('Invalid layer id')
  }

  const url = new URL(`${layer}/0/query`)

  const accessToken = await getCachedToken(server)
  url.searchParams.set('token', accessToken)
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('outFields', outFields)

  if (resultCount) {
    url.searchParams.set('resultRecordCount', `${resultCount}`)
  }

  if (landParcelId) {
    url.searchParams.set('where', `PARCEL_ID='${landParcelId}'`)
  }

  return url
}

/**
 * @param {import("@hapi/hapi").Server<any>} server
 * @param {string} landParcelId
 * @param {LayerId} layerId
 */
export async function getIntersect(server, landParcelId, layerId) {
  const url = await constructArcGisUrl(server, { layerId, landParcelId })
  const response = await fetch(url)
  return await response.json()
}

const getUserToken = async () => {
  const url = new URL('https://www.arcgis.com/sharing/rest/generateToken')
  const body = new FormData()
  body.append('username', config.get('arcGis.username'))
  body.append('password', config.get('arcGis.password'))
  body.append('referer', '*')
  body.append('f', 'json')

  const response = await fetch(url, { method: 'post', body })
  const json = await response.json()

  return {
    id: 'token',
    access_token: json.token
  }
}

let cache

/**
 *  ArcGIS token cache
 * @param { import('@hapi/hapi').Server } server
 */
export function getCachedToken(server) {
  if (!cache) {
    cache = initCache(
      server,
      'arcgis_token',
      async () => {
        return await getUserToken()
      },
      {
        expiresIn: 7200
      }
    )
  }
  return cache(server).get('arcgis_token')
}

/** @import { LandParcel, Application, LayerId } from '../types.js' */
