import Boom from '@hapi/boom'
import isNull from 'lodash/isNull.js'

import { findLandCover } from '../helpers/find-land-cover.js'

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const findLandCoverController = {
  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => {
    const entity = await findLandCover(
      request.server,
      request.params.landParcelId
    )
    if (isNull(entity)) {
      return Boom.boomify(Boom.notFound())
    }

    return h.response({ message: 'success', entity }).code(200)
  }
}

export { findLandCoverController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
