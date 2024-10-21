import { findAllCompatibleActions } from '~/src/api/action-compatibility-matrix/helpers/find-compatible-actions-data.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

let cache
const logger = createLogger()

const initCache = (server) => {
  logger.info('Initialising compatibleActions cache')
  cache = server.cache({
    cache: 'frps',
    segment: 'compatibleActions',
    expiresIn: 10 * 1000,
    generateFunc: async (id) => {
      logger.info(`Caching action ${id.action}`)
      return await findAllCompatibleActions(id.db, id.action)
    },
    generateTimeout: 2000
  })
}

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
    const {
      server,
      db,
      params: { action }
    } = request

    if (!cache) initCache(server)
    const id = action
    const entities = await cache.get({ id, db, action })
    return h.response({ message: 'success', entities }).code(200)
  }
}

export { findCompatibleActions }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
