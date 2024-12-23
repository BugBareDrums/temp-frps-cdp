import Boom from '@hapi/boom'
import Joi from 'joi'
import isNull from 'lodash/isNull.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { findLandParcelsBySbi } from '../helpers/find-land-parcel-by-sbi.js'
import { findLandParcel, findLandCover } from '~/src/services/arcgis.js'
import { findLandCoverCode } from '../helpers/find-land-cover-code.js'

const logger = createLogger()

/**
 * Transforms the parcel data from ArcGIS format to a simplified format.
 * @param {string} sbi - Single Business ID in string format.
 * @param {Array} parcels - Array of land parcels.
 * @returns {Array} Transformed data for each parcel.
 */
const transformParcelData = (sbi, parcels) =>
  parcels.map((parcel) => ({
    id: parcel.PARCEL_ID,
    sheetId: parcel.SHEET_ID,
    sbi,
    agreements: parcel.agreements,
    attributes: parcel.attributes,
    area: (parcel.GEOM_AREA_SQM / 10000).toFixed(4),
    centroidX: parcel.CENTROID_X,
    centroidY: parcel.CENTROID_Y,
    validated: parcel.VALIDATED,
    features: parcel.features.map((feature) => ({
      area: (feature.GEOM_AREA_SQM / 10000).toFixed(4), // Convert to hectares
      validFrom: feature.VALID_FROM,
      validTo: feature.VALID_TO,
      verifiedOn: feature.VERIFIED_ON,
      lastRefreshDate: feature.LAST_REFRESH_DATE,
      shapeArea: feature.Shape__Area,
      shapeLength: feature.Shape__Length,
      landUseList: feature.landCodeDetails.uses,
      landCovers: {
        code: feature.landCodeDetails.code,
        name: feature.landCodeDetails.name
      }
    }))
  }))

const getLandParcels = async (server, userParcels) => {
  const parcelIds = userParcels.map((parcel) => parcel.id)
  const parcelSheetIds = userParcels.map((parcel) => parcel.sheetId)
  return await findLandParcel(
    server,
    parcelIds.toString(),
    parcelSheetIds.toString()
  )
}

const getLandCovers = async (server, userParcels) => {
  const parcelIds = userParcels.map((parcel) => parcel.id)
  const parcelSheetIds = userParcels.map((parcel) => parcel.sheetId)
  return await findLandCover(
    server,
    parcelIds.toString(),
    parcelSheetIds.toString()
  )
}

const getLandCoverDetails = async (db, landCovers) =>
  await Promise.all(
    landCovers.features.map(async (feature) => ({
      properties: {
        landCodeDetails: await findLandCoverCode(
          db,
          feature.properties.LAND_COVER_CLASS_CODE
        ),
        ...feature.properties
      }
    }))
  )

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const findLandParcelBySbiController = {
  options: {
    validate: {
      params: Joi.object({
        sbi: Joi.number().required()
      }),
      failAction: (request, h, error) => {
        logger.error(error)
        return Boom.badRequest(error)
      }
    }
  },

  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => {
    /** @type { BusinessParcel[] } */
    const userParcels = await findLandParcelsBySbi(
      request,
      request.params.sbi.toString()
    )
    if (isNull(userParcels)) {
      return Boom.notFound()
    }

    const landParcels = await getLandParcels(request.server, userParcels)
    if (!landParcels) return Boom.notFound('No parcel data found')

    const landCovers = await getLandCovers(request.server, userParcels)
    if (!landCovers) return Boom.notFound('No cover data found')

    const landCoversWithDetails = await getLandCoverDetails(
      request.db,
      landCovers
    )

    const landParcelsWithCovers = landParcels.features.map((parcel) => {
      const userParcel = userParcels.find(
        (userParcel) => userParcel.id === parcel.properties.PARCEL_ID
      )

      return {
        ...parcel.properties,
        agreements: userParcel?.agreements,
        attributes: userParcel?.attributes,
        features: landCoversWithDetails
          .filter(
            (cover) =>
              cover.properties.PARCEL_ID === parcel.properties.PARCEL_ID &&
              cover.properties.SHEET_ID === parcel.properties.SHEET_ID
          )
          .map((cover) => cover.properties)
      }
    })

    return h
      .response(transformParcelData(request.params.sbi, landParcelsWithCovers))
      .code(200)
  }
}

export { findLandParcelBySbiController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 * @import { BusinessParcel } from '~/src/api/land/helpers/find-land-parcel-by-sbi.js'
 */
