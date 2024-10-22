import Hapi from '@hapi/hapi'
import { action } from '../index.js'

jest.mock('../helpers/find-all-actions.js', () => ({
  findAllActions: jest.fn(() =>
    Promise.resolve([
      {
        code: 'SAM1',
        description:
          'Assess soil, test soil organic matter and produce a soil management plan',
        payment: {
          amountPerHectare: 5.8,
          additionalPaymentPerAgreement: 95
        },
        eligibilityRules: [
          { id: 'is-below-moorland-line' },
          { id: 'is-for-whole-parcel-area' }
        ]
      }
    ])
  )
}))

describe('Get Action controller', () => {
  const server = Hapi.server()

  beforeAll(async () => {
    await server.register([action])
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('GET /action route should return 400 when parcel-id query parameter is missing', async () => {
    const request = {
      method: 'GET',
      url: '/action'
    }
    const response = await server.inject(request)
    expect(response.statusCode).toBe(400)
  })

  // TODO tests with preexisting actions for GET and POST

  test('GET /action route should return 200 when parcel-id query parameter is provided', async () => {
    const request = {
      method: 'GET',
      url: '/action?parcel-id=123&land-use-codes=AC32'
    }
    const response = await server.inject(request)
    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual([
      {
        code: 'SAM1',
        description:
          'Assess soil, test soil organic matter and produce a soil management plan',
        payment: {
          amountPerHectare: 5.8,
          additionalPaymentPerAgreement: 95
        }
      }
    ])
  })
})
