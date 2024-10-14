import { importOptionsController } from '~/src/api/importData/controllers/index.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const importData = {
  plugin: {
    name: 'importData',
    register: (server) => {
      server.route([
        {
          method: 'POST',
          path: '/importData/options',
          options: {
            payload: {
              maxBytes: Number.MAX_SAFE_INTEGER
            }
          },
          ...importOptionsController
        }
      ])
    }
  }
}

export { importData }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
