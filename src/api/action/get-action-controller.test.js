import Hapi from '@hapi/hapi'
import { action } from './index.js'

describe('#actionController', () => {
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
          additionalPaymentPerAgreement: 95,
          amountPerHectare: 5.8
        }
      },
      {
        code: 'SAM2',
        description: 'Multi-species winter cover crop',
        payment: { amountPerHectare: 129 }
      },
      {
        code: 'AB3',
        description: 'Beetle banks',
        payment: {
          amountPerHectare: 573.0
        }
      },
      {
        code: 'CSAM1',
        description:
          'Assess soil, produce a soil management plan and test soil organic matter',
        payment: {
          additionalPaymentPerAgreement: 97,
          amountPerHectare: 6
        }
      },
      {
        code: 'CSAM2',
        description: 'Multi-species winter cover crop',
        payment: {
          amountPerHectare: 129
        }
      }
    ])
  })
})
