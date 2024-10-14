import Boom from '@hapi/boom'
import { actionLandUseCompatibilityMatrix } from '~/src/api/available-area/action-land-use-compatibility-matrix.js'
import { getActions } from '~/src/api/land-action/index.js'

const getActionsForLandUses = (landUseCodes) => {
  if (!Array.isArray(landUseCodes)) {
    throw new TypeError('landUseCodes must be an array')
  }
  const actions = getActions()
  return actions.filter((action) => {
    const compatibleLandUses =
      actionLandUseCompatibilityMatrix[action.code] || []
    return landUseCodes.some((code) => compatibleLandUses.includes(code))
  })
}

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const getActionController = {
  /**
   * @param { import('@hapi/hapi').Request } request
   * @returns {Promise<*>}
   */
  handler: (request) => {
    const parcelId = request.query['parcel-id']
    const landUseCodesString = request.query['land-use-codes']
    const preexistingActions = request.query['preexisting-actions']
      ? request.query['preexisting-actions'].split(',')
      : []
    const landUseCodes = landUseCodesString ? landUseCodesString.split(',') : []

    if (!parcelId) {
      return Boom.boomify(Boom.badRequest('Missing parcel-id query parameter'))
    }

    const filteredActions = getActionsForLandUses(landUseCodes)
      .filter((action) => !preexistingActions.includes(action.code))
      .map((action) => {
        return {
          code: action.code,
          description: action.description,
          payment: action.payment
        }
      })
    return Promise.resolve(filteredActions)
  }
}

export { getActionController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 */
