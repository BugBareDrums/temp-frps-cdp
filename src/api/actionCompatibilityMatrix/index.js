import { findCompatibleActions } from '~/src/api/actionCompatibilityMatrix/controllers/index.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const actionCompatibilityMatrix = {
  plugin: {
    name: 'compatibilityMatrix',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/compatibilityMatrix/{action}',
          ...findCompatibleActions
        }
      ])
    }
  }
}

export { actionCompatibilityMatrix }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
