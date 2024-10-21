import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

export const initCache = (server, segment, generateFunc, options) => {
  logger.info(`Initialising ${segment} cache`)
  return server.cache({
    cache: 'frps',
    segment,
    expiresIn: 10 * 1000,
    generateTimeout: 2000,
    generateFunc,
    ...options
  })
}
