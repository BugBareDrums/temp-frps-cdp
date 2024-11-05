import { config } from '~/src/config/index.js'
import { initCache } from '~/src/helpers/cache.js'

/**
 * @type {Record<string, string>}
 */
const baseUrls = {
  landParcel:
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/LMS_reference_parcels/FeatureServer',
  intersects:
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Parcel_and_SSSI_intersects/FeatureServer',
  landCover:
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Land_Covers/FeatureServer'
}

/**
 * @param {import("@hapi/hapi").Server<any>} server
 * @param {{ resourceName: keyof baseUrls; landParcelId?: string; outFields?: "*"; resultCount?: number; }} options
 */
async function constructArcGisUrl(server, options) {
  const { resourceName, landParcelId, outFields = '*', resultCount } = options
  const layer = baseUrls[resourceName]

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
 * Finds and returns a single land parcel from ArcGIS.
 * @param { import('@hapi/hapi').Server } server
 * @param { string } landParcelId
 * @returns {Promise<{}|null>}
 */
export async function findLandParcel(server, landParcelId) {
  const url = await constructArcGisUrl(server, {
    resourceName: 'landParcel',
    landParcelId
  })

  const response = await fetch(url)
  return await response.json()
}

/**
 * Finds and returns a single land parcel from ArcGIS.
 * @param { import('@hapi/hapi').Server } server
 * @param { string } landParcelId
 * @returns {Promise<{}|null>}
 */
export async function findLandCover(server, landParcelId) {
  const url = await constructArcGisUrl(server, {
    resourceName: 'landCover',
    landParcelId
  })

  const response = await fetch(url)
  return await response.json()
}

export async function getIntersect(server, landParcelId) {
  const url = await constructArcGisUrl(server, {
    resourceName: 'intersects',
    landParcelId
  })
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
