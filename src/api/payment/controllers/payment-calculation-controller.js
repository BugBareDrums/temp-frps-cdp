// src/api/payment/controllers/payment-calculation-controller.js
import Joi from 'joi'
import Boom from '@hapi/boom'
import { findAction } from '../../action/helpers/find-action.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { findAllCompatibleActions } from '~/src/api/action-compatibility-matrix/helpers/find-compatible-actions-data.js'

const logger = createLogger()

/**
 * Payment calculation controller
 * Calculates the payment
 * @satisfies {Partial<ServerRoute>}
 */
const paymentCalculationController = {
  options: {
    validate: {
      payload: Joi.object({
        actions: Joi.array()
          .items(
            Joi.object({
              'action-code': Joi.string().required(),
              'hectares-applied-for': Joi.number().required()
            })
          )
          .required(),
        'land-use-codes': Joi.array().items(Joi.string()).required()
      }),
      failAction: (request, h, error) => {
        logger.error(error)
        return Boom.badRequest(error)
      }
    }
  },

  /**
   * @typedef { import('@hapi/hapi').Request & object } RequestPayload
   * @property { Array } actions
   */

  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin & RequestPayload } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns { Promise<*> }
   */
  handler: async ({ db, payload: { actions } }, h) => {
    try {
      const actionCodes = actions.map((action) => action['action-code'])
      const compatibleActions = await Promise.all(
        actionCodes.map((action) => findAllCompatibleActions(db, action))
      )

      const actionsMissing = compatibleActions.some(
        (compatibleAction) => compatibleAction.length === 0
      )

      if (actionsMissing) {
        logger.error({ message: 'No action codes found for: ', actionCodes })
        return h
          .response({ message: 'No action codes found for: ', actionCodes })
          .code(404)
      }

      const actionPromises = await Promise.all(
        actionCodes.map((actionCode) => findAction(db, actionCode))
      )

      const payments = actions.map((actionRequest, index) => {
        const actionCode = actionRequest['action-code']
        const action = actionPromises[index]
        const hectaresAppliedFor = parseFloat(
          actionRequest['hectares-applied-for'] ?? 0
        )
        const paymentAmount =
          hectaresAppliedFor * action.payment.amountPerHectare +
          (action.payment.additionalPaymentPerAgreement ?? 0)
        return {
          'action-code': actionCode,
          payment: paymentAmount
        }
      })

      return h.response(payments).code(200)
    } catch (error) {
      return h.response({ message: error.message }).code(500)
    }
  }
}

export { paymentCalculationController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
