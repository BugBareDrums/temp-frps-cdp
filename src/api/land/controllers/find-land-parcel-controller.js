import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { findLandParcel } from '../helpers/find-land-parcel.js'

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const findLandParcelController = {
  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => {
    const entity = await findLandParcel(
      request.server,
      request.params.landParcelId
    )
    if (isNull(entity)) {
      return Boom.boomify(Boom.notFound())
    }

    return h.response({ message: 'success', entity }).code(200)
  }
}

export { findLandParcelController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */