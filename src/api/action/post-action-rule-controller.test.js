import Hapi from '@hapi/hapi'
import { getAction } from '../land-action/index.js'
import { action } from './index.js'

describe('Post Action Rule controller', () => {
  const server = Hapi.server()

  beforeAll(async () => {
    await server.register([action])
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('POST /action/AB3/rule should add a rule successfully', async () => {
    const request = {
      method: 'POST',
      url: '/action/AB3/rule',
      payload: {
        id: 'new-rule',
        config: {}
      }
    }
    /** @type {Hapi.ServerInjectResponse<{message: string}>} */
    const response = await server.inject(request)
    expect(response.statusCode).toBe(200)

    expect(response.result?.message).toBe('Rule added successfully')

    const action = getAction('AB3')
    expect(action.eligibilityRules.some((rule) => rule.id === 'new-rule')).toBe(
      true
    )
  })

  test('POST /action/NON_EXISTENT/rule should return 404 for non-existent action', async () => {
    const request = {
      method: 'POST',
      url: '/action/NON_EXISTENT/rule',
      payload: {
        id: 'new-rule',
        config: {}
      }
    }
    /** @type {Hapi.ServerInjectResponse<{error: string}>} */
    const response = await server.inject(request)
    expect(response.statusCode).toBe(404)
    expect(response.result?.error).toBe('Not Found')
  })

  test('POST /action/AB3/rule should not add duplicate rule', async () => {
    const request = {
      method: 'POST',
      url: '/action/AB3/rule',
      payload: {
        id: 'is-below-moorland-line',
        config: {}
      }
    }
    const response = await server.inject(request)
    expect(response.statusCode).toBe(200)
    const action = getAction('AB3')
    const ruleCount = action.eligibilityRules.filter(
      (rule) => rule.id === 'is-below-moorland-line'
    ).length
    expect(ruleCount).toBe(1)
  })
})
