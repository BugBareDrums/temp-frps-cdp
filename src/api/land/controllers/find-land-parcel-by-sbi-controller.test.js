import Hapi from '@hapi/hapi'
import { land } from '../index.js'
import { farmers as mockFarmers } from '~/src/helpers/seed-db/data/farmers.js'
import { codes as mockCodes } from '~/src/helpers/seed-db/data/codes.js'
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
  findLandCoverCode: jest.fn(() =>
    Promise.resolve(mockCodes[0].classes[1].covers[0])
  )
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
        expect(result).toStrictEqual([
          {
            agreements: [],
            area: '0.1939',
            attributes: {
              moorlandLineStatus: 'below'
            },
            centroidX: 402471.849106535,
            centroidY: 341698.241947721,
            createdBy: 'CAPMIG',
            createdOn: 1426500556000,
            id: 1732,
            landCovers: { code: '131', name: 'Permanent grassland' },
            landUseList: [{ code: 'PG01', name: 'Permanent grassland' }],
            lastRefreshDate: 1709718104000,
            osSheetId: 'SK0241',
            parcelId: '4769',
            sbi: 908789876,
            shapeArea: 5341.636962890625,
            shapeLength: 311.55161847415724,
            validFrom: 1262304001000,
            validTo: 253402214400000,
            validated: 'N',
            verificationType: 2000,
            verifiedOn: 1622851200000,
            wktFormatGeometry:
              'POLYGON ((402472.23995 341737.42985,402442.79995 341703.05995,402445.66005 341700.12995,402451.87005 341693.52985,402458.92995 341685.93985,402471.28005 341673.22995,402481.66005 341662.56985,402497.29995 341678.93985,402490.98005 341694.15985,402482.48005 341713.98995,402472.23995 341737.42985))'
          }
        ])
      })
    })
  })
})
