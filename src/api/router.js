import { health } from '~/src/api/health/index.js'
import { example } from '~/src/api/example/index.js'
import { importData } from '~/src/api/import-data/index.js'
import { actionCompatibilityMatrix } from '~/src/api/action-compatibility-matrix/index.js'
import { availableArea } from './available-area/index.js'

/**
 * @satisfies { import('@hapi/hapi').ServerRegisterPluginObject<*> }
 */
const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Import data endpoints
      await server.register([importData])

      // Get Action compatibility matrix
      await server.register([actionCompatibilityMatrix])

      // Get available area
      await server.register([availableArea])

      // Application specific routes, add your own routes here.
      await server.register([example])
    }
  }
}

export { router }
