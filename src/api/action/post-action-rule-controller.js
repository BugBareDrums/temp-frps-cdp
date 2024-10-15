import Boom from '@hapi/boom'
import { addRule, getAction } from '../land-action/index.js'

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const postActionRuleController = {
  /**
   * @param { import('@hapi/hapi').Request } request
   * @returns {Promise<{message: string}>}
   */
  handler: ({ params: { actionCode }, payload }) => {
    const action = getAction(actionCode)

    if (!action) {
      return Boom.boomify(Boom.notFound('Not found'))
    }

    addRule(action, payload)
    return Promise.resolve({ message: 'Rule added successfully' })
  }
}

export { postActionRuleController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 */
