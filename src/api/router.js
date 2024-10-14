import { health } from '~/src/api/health/index.js'
import { example } from '~/src/api/example/index.js'
import { importData } from '~/src/api/importData/index.js'

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

      // Application specific routes, add your own routes here.
      await server.register([example])
    }
  }
}

export { router }
