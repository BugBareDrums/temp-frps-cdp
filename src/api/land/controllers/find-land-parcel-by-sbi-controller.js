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
 * @param {object} classCodeInfo - the raw data from the class code endpoint.
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
      landCovers: {
        code: classCodeInfo.code,
        name: classCodeInfo.name
      },
      agreements,
      landUseList: classCodeInfo.uses,
      attributes
    }
  })
}

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
    const parcels = await findLandParcelsBySbi(
      request,
      request.params.sbi.toString()
    )
    if (isNull(parcels)) {
      return Boom.notFound()
    }

    const parcelIds = parcels.map((parcel) => parcel.id)
    const parcelSheetIds = parcels.map((parcel) => parcel.sheetId)

    const landParcelData = await findLandParcel(
      request.server,
      parcelIds[0],
      parcelSheetIds[0]
    )

    if (!landParcelData) return Boom.notFound('No matching parcels found')

    const landParcelCoverData = await findLandCover(
      request.server,
      parcelIds[0],
      parcelSheetIds[0]
    )

    if (!landParcelCoverData) return Boom.notFound('No parcel data found')

    const classCode =
      landParcelCoverData.features[0].properties.LAND_COVER_CLASS_CODE
    const classCodeInfo = await findLandCoverCode(request.db, classCode)

    return h
      .response(
        transformParcelData(request.params.sbi, parcels, classCodeInfo, {
          entity: { features: landParcelData.features }
        })
      )
      .code(200)
  }
}

export { findLandParcelBySbiController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
