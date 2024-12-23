import { executeRules } from './rulesEngine.js'

/**
 * @returns {Application}
 */
const createApplication = () => {
  return {
    areaAppliedFor: 100,
    actionCodeAppliedFor: 'GRH7',
    landParcel: {
      area: 100,
      existingAgreements: [{ area: 100, code: 'LIG2' }],
      intersections: {
        sssi: 0,
        monument: 0,
        moorland: 0,
        lfa: 0,
        landParcel: 100
      }
    }
  }
}

describe('Rules Engine', function () {
  describe('executeRules', function () {
    test('should run all required rules', function () {
      const application = createApplication()

      const result = executeRules(application, [
        {
          id: 'supplement-area-matches-parent',
          config: { baseActions: ['CLIG3', 'LIG1', 'LIG2', 'GRH6'] }
        }
      ])

      expect(result).toStrictEqual({
        passed: true,
        results: [{ ruleName: 'supplement-area-matches-parent', passed: true }]
      })
    })

    test('should throw error if no rules are provided to execute', function () {
      const application = createApplication()

      const executeRulesInvocation = () => {
        executeRules(application, [])
      }

      expect(executeRulesInvocation).toThrow('No rules provided to execute')
    })

    test('should throw error if an invalid rule identifier is provided', function () {
      const application = createApplication()

      const executeRulesInvocation = () => {
        executeRules(application, [{ id: 'test-non-existent-rule-id' }])
      }

      expect(executeRulesInvocation).toThrow(
        'Unknown rule: test-non-existent-rule-id'
      )
    })
  })
})

/** @import { LandParcel, Application, LayerId } from '../types.js' */
