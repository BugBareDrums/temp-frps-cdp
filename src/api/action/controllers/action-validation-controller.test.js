import Hapi from '@hapi/hapi'
import { action } from '../index.js'

describe('Action Validation controller', () => {
  const server = Hapi.server()

  beforeAll(async () => {
    await server.register([action])
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('POST /action route should return 404 when actionCode parameter is missing', async () => {
    const request = {
      method: 'POST',
      url: '/action-validation'
    }
    const response = await server.inject(request)
    expect(response.statusCode).toBe(404)
  })
})
