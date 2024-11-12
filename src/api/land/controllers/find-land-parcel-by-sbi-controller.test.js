import Hapi from '@hapi/hapi'
import { land } from '../index.js'
import { farmers as mockFarmers } from '~/src/helpers/seed-db/data/farmers.js'
import CatboxMemory from '@hapi/catbox-memory'

jest.mock('../../../services/arcgis')

jest.mock('../helpers/find-land-parcel-by-sbi.js', () => ({
  findLandParcelsBySbi: jest.fn((db, sbi) => {
    const results = mockFarmers.find((farmer) =>
      farmer.companies.filter((company) => company.sbi === sbi)
    )

    if (!results) return Promise.reject(new Error('No matching companies'))

    const company = [results][0].companies.filter(
      (company) => company.sbi === sbi
    )

    // Get the parcels
    const parcels = company[0].parcels.map((parcel) => ({
      id: parcel.id,
      sheetId: parcel.sheetId,
      agreements: parcel.agreements,
      attributes: parcel.attributes
    }))

    return Promise.resolve(parcels)
  })
}))

jest.mock('../helpers/find-land-cover-code.js', () => ({
  findLandCoverCode: jest.fn((db, code) => {
    const responses = {
      131: {
        name: 'Permanent grassland',
        code: '131',
        uses: [
          {
            name: 'Permanent grassland',
            code: 'PG01'
          }
        ]
      },
      118: {
        name: 'Other arable crops',
        code: '118',
        uses: [
          {
            name: 'Barley - spring',
            code: 'AC01'
          }
        ]
      },
      583: {
        name: 'Rivers and Streams type 3',
        code: '583',
        uses: [
          {
            name: 'Rivers and Streams type 3',
            code: 'IW03'
          }
        ]
      }
    }
    return Promise.resolve(responses[code])
  })
}))

describe('Land Parcel by SBI controller', () => {
  const server = Hapi.server({
    cache: [
      {
        name: 'frps',
        provider: {
          constructor: CatboxMemory.Engine
        }
      }
    ]
  })

  beforeAll(async () => {
    await server.register([land])
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('GET /land/parcel/{sbi} route', () => {
    describe('an invalid request', () => {
      test('should return 404 if theres no SBI', async () => {
        const request = {
          method: 'GET',
          url: '/land/parcel'
        }

        /** @type { Hapi.ServerInjectResponse<object> } */
        const { statusCode } = await server.inject(request)

        expect(statusCode).toBe(404)
      })

      test('should return 404 is the SBI isnt a number', async () => {
        const request = {
          method: 'GET',
          url: '/land/parcel/not_a_number'
        }

        /** @type { Hapi.ServerInjectResponse<object> } */
        const {
          statusCode,
          result: { message }
        } = await server.inject(request)

        expect(statusCode).toBe(400)
        expect(message).toBe('"sbi" must be a number')
      })
    })

    describe('a valid request', () => {
      test('should return 200 with a matching business', async () => {
        const request = {
          method: 'GET',
          url: '/land/parcel/908789876'
        }

        /** @type { Hapi.ServerInjectResponse<object> } */
        const { statusCode, result } = await server.inject(request)

        expect(statusCode).toBe(200)
        expect(result).toHaveLength(3)
        expect(result[0]).toStrictEqual({
          id: '4769',
          sbi: 908789876,
          sheetId: 'SK0241',
          agreements: [],
          attributes: {
            moorlandLineStatus: 'below'
          },
          centroidX: 402471.849106535,
          centroidY: 341698.241947721,
          validated: 'N',
          wktFormatGeometry:
            'POLYGON ((402472.23995 341737.42985,402442.79995 341703.05995,402445.66005 341700.12995,402451.87005 341693.52985,402458.92995 341685.93985,402471.28005 341673.22995,402481.66005 341662.56985,402497.29995 341678.93985,402490.98005 341694.15985,402482.48005 341713.98995,402472.23995 341737.42985))',
          features: [
            {
              area: '0.1939',
              landCovers: { code: '131', name: 'Permanent grassland' },
              landUseList: [{ code: 'PG01', name: 'Permanent grassland' }],
              lastRefreshDate: 1709719441000,
              shapeArea: 5341.63818359375,
              shapeLength: 311.5516163661165,
              validFrom: 1262304001000,
              validTo: 253402214400000,
              verifiedOn: 1622851200000
            }
          ]
        })
      })
    })
  })
})
