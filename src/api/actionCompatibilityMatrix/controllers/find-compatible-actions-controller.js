import { findAllCompatibleActions } from '~/src/api/actionCompatibilityMatrix/helpers/find-compatible-actions-data.js'

/**
 * Example controller
 * Finds all entries in a mongodb collection
 * @satisfies {Partial<ServerRoute>}
 */
const findCompatibleActions = {
  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => {
    const entities = await findAllCompatibleActions(
      request.db,
      request.params.action
    )

    return h.response({ message: 'success', entities }).code(200)
  }
}

export { findCompatibleActions }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
