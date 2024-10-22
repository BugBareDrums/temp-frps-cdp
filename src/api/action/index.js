import { getActionController } from './controllers/get-action-controller.js'
import { postActionRuleController } from './controllers/post-action-rule-controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const action = {
  plugin: {
    name: 'action',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/action',
          ...getActionController
        },
        {
          method: 'POST',
          path: '/action/{actionCode}/rule',
          ...postActionRuleController
        }
      ])
    }
  }
}

export { action }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
