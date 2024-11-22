import { calculateIntersectionArea } from './calculate-intersection-area.js'
import * as arcgisService from '~/src/services/arcgis.js'

// Mock ArcGIS services
jest.mock('~/src/services/arcgis.js', () => ({
  findLandParcel: jest.fn(),
  fetchMoorlandIntersection: jest.fn()
}))

// Mock fetch globally for external API calls
global.fetch = jest.fn()

describe('#calculateIntersectionArea', () => {
  const mockServer = {}
  const landParcelId = '1234'
  const sheetId = '5678'

  const mockLandParcelResponse = {
    features: [
      {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-3.84215781948155, 50.2369627492092],
              [-3.84188557735844, 50.236368577696],
              [-3.84159762148358, 50.2357813103825],
              [-3.84215781948155, 50.2369627492092]
            ]
          ]
        },
        properties: {
          GEOM_AREA_SQM: 50000 // Parcel area for calculations
        }
      }
    ]
  }

  const mockMoorlandResponse = {
    features: [
      {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-1.6372452684743, 53.4616238095816],
              [-1.63724434740339, 53.4616161198859],
              [-1.63723104195301, 53.4615013063136],
              [-1.6372452684743, 53.4616238095816]
            ]
          ]
        }
      },
      {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-1.6352452684743, 53.4611238095816],
              [-1.63524434740339, 53.4611161198859],
              [-1.63523104195301, 53.4605013063136],
              [-1.6352452684743, 53.4611238095816]
            ]
          ]
        }
      }
    ]
  }

  const mockIntersectResponse = {
    geometryType: 'esriGeometryPolygon',
    geometries: [
      {
        rings: [
          [
            [-117.18330000340939, 34.04949999973178],
            [-117.18999999761581, 34.049300000071526],
            [-117.18999999761581, 34.05400000140071],
            [-117.18330000340939, 34.05400000140071],
            [-117.18330000340939, 34.04949999973178]
          ]
        ]
      },
      {
        rings: [
          [
            [-117.1900000034094, 34.05450000140071],
            [-117.19199999761581, 34.05470000007153],
            [-117.19199999761581, 34.05500000140071],
            [-117.1900000034094, 34.05500000140071],
            [-117.1900000034094, 34.05450000140071]
          ]
        ]
      }
    ]
  }

  const mockAreasResponse = {
    areas: [20000, 15000], // Areas for the two intersecting geometries
    lengths: [null] // Not used in this case
  }

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    // @ts-expect-error TS N/A
    global.fetch.mockClear()
    // Reinitialize mocks
    // @ts-expect-error TS N/A
    global.fetch = jest.fn((url) => {
      // @ts-expect-error TS N/A
      if (url.includes('intersect')) {
        return Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => mockIntersectResponse
        })
        // @ts-expect-error TS N/A
      } else if (url.includes('areasAndLengths')) {
        return Promise.resolve({
          ok: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          json: async () => mockAreasResponse
        })
      } else {
        return Promise.reject(new Error('Unknown URL'))
      }
    })
    // @ts-expect-error false negative
    arcgisService.findLandParcel.mockResolvedValue(mockLandParcelResponse)
    // @ts-expect-error false negative
    arcgisService.fetchMoorlandIntersection.mockResolvedValue(
      mockMoorlandResponse
    )
  })

  test('should fetch intersections, calculate areas, and return the result', async () => {
    const result = await calculateIntersectionArea(
      mockServer,
      landParcelId,
      sheetId
    )

    const expected = {
      parcelId: '1234',
      totalArea: 35000, // Sum of areas from the mockAreasResponse
      availableArea: 15000 // 50000 - 35000
    }

    // Assert
    expect(result).toEqual(expected)
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(
      mockServer,
      landParcelId,
      sheetId
    )
    expect(arcgisService.fetchMoorlandIntersection).toHaveBeenCalledWith(
      mockServer,
      {
        rings: [
          [
            [-3.84215781948155, 50.2369627492092],
            [-3.84188557735844, 50.236368577696],
            [-3.84159762148358, 50.2357813103825],
            [-3.84215781948155, 50.2369627492092]
          ]
        ]
      }
    )
    expect(fetch).toHaveBeenCalledTimes(2) // One call for intersection, one for areas
  })

  test('should handle no land parcel features gracefully', async () => {
    // @ts-expect-error false negative
    arcgisService.findLandParcel.mockResolvedValueOnce({ features: [] })

    const result = await calculateIntersectionArea(
      mockServer,
      landParcelId,
      sheetId
    )

    const expected = {
      parcelId: '1234',
      totalArea: 0,
      availableArea: 0
    }

    expect(result).toEqual(expected)
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(
      mockServer,
      landParcelId,
      sheetId
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  test('should handle no Moorland intersections gracefully', async () => {
    // @ts-expect-error false negative
    arcgisService.fetchMoorlandIntersection.mockResolvedValueOnce({
      features: []
    })

    const result = await calculateIntersectionArea(
      mockServer,
      landParcelId,
      sheetId
    )

    const expected = {
      parcelId: '1234',
      totalArea: 0,
      availableArea: 50000 // Full parcel area since no intersections
    }

    expect(result).toEqual(expected)
    expect(arcgisService.fetchMoorlandIntersection).toHaveBeenCalledWith(
      mockServer,
      {
        rings: [
          [
            [-3.84215781948155, 50.2369627492092],
            [-3.84188557735844, 50.236368577696],
            [-3.84159762148358, 50.2357813103825],
            [-3.84215781948155, 50.2369627492092]
          ]
        ]
      }
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
