import { availableAreaController } from './controllers/index.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const availableArea = {
  plugin: {
    name: 'available-area',
    register: (server) => {
      server.route([
        {
          method: 'POST',
          path: '/available-area',
          ...availableAreaController
        }
      ])
    }
  }
}

export { availableArea }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
