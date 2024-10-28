import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { findLandParcelsBySbi } from '../helpers/find-land-parcel-by-sbi.js'

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const findLandParcelBySbiController = {
  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => {
    const entity = await findLandParcelsBySbi(
      request.server,
      request.params.sbi
    )
    if (isNull(entity)) {
      return Boom.boomify(Boom.notFound())
    }

    return h.response(entity).code(200)
  }
}

export { findLandParcelBySbiController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
