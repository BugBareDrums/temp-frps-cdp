import { getActionController } from './get-action-controller.js'
import { postActionRuleController } from './post-action-rule-controller.js'

const ACTION_RULE_PATH = '/action/{actionCode}/rule'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const action = {
  plugin: {
    name: 'action',
    register: (server) => {
      server.route({
        method: 'GET',
        path: '/action',
        ...getActionController
      })

      server.route({
        method: 'POST',
        path: ACTION_RULE_PATH,
        ...postActionRuleController
      })
    }
  }
}

export { action }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
