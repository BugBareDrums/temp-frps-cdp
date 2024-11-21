import { calculateIntersectionArea } from './calculate-intersection-area.js'
import * as arcgisService from '~/src/services/arcgis.js'

jest.mock('~/src/services/arcgis.js', () => ({
  findLandParcel: jest.fn(),
  fetchMoorlandIntersection: jest.fn()
}))

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

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock intersection API fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
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
      })
    })

    arcgisService.findLandParcel.mockResolvedValue(mockLandParcelResponse)
    arcgisService.fetchMoorlandIntersection.mockResolvedValue(mockMoorlandResponse)
  })

  test('should fetch intersections and return intersect geometries', async () => {
    const result = await calculateIntersectionArea(
      mockServer,
      landParcelId,
      sheetId
    )
    const expected = [
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

    // Assert
    expect(result).toEqual(expected)
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(mockServer, landParcelId, sheetId)
    expect(arcgisService.fetchMoorlandIntersection).toHaveBeenCalledWith(
      mockServer,
      mockLandParcelResponse.features[0].geometry
    )
    expect(fetch).toHaveBeenCalledTimes(1) // Only one call to the intersect API
  })

  test('should handle no land parcel features gracefully', async () => {
    arcgisService.findLandParcel.mockResolvedValueOnce({ features: [] })

    const result = await calculateIntersectionArea(mockServer, landParcelId, sheetId)

    expect(result).toEqual([])
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(mockServer, landParcelId, sheetId)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('should handle no Moorland intersections gracefully', async () => {
    arcgisService.fetchMoorlandIntersection.mockResolvedValueOnce({ features: [] })

    const result = await calculateIntersectionArea(mockServer, landParcelId, sheetId)

    expect(result).toEqual([])
    expect(arcgisService.fetchMoorlandIntersection).toHaveBeenCalledWith(
      mockServer,
      mockLandParcelResponse.features[0].geometry
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
