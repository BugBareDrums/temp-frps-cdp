import { calculateIntersectionArea } from './calculate-intersection-area.js'
import * as arcgisService from '~/src/services/arcgis.js'

jest.mock('~/src/services/arcgis.js', () => ({
  findLandParcel: jest.fn(),
  fetchMoorlandIntersection: jest.fn()
}))

describe('#calculateIntersectionArea', () => {
  test('should call findLandParcel and fetchMoorlandIntersection with correct geometry', async () => {
    // Arrange
    const mockServer = {}
    const landParcelId = '1234'
    const sheetId = '5678'

    const mockCoordinates = [
      [
        [-3.84215781948155, 50.2369627492092],
        [-3.84188557735844, 50.236368577696],
        [-3.84159762148358, 50.2357813103825],
        [-3.84215781948155, 50.2369627492092]
      ]
    ]

    const mockParcelGeometry = {
      type: 'Polygon',
      coordinates: mockCoordinates
    }

    const mockLandParcelResponse = {
      features: [{ geometry: mockParcelGeometry }]
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
        }
      ]
    }

    arcgisService.findLandParcel.mockResolvedValueOnce(mockLandParcelResponse)
    arcgisService.fetchMoorlandIntersection.mockResolvedValueOnce(mockMoorlandResponse)

    // Act
    const result = await calculateIntersectionArea(mockServer, landParcelId, sheetId)

    // Assert
    expect(result).toBe(100)
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(mockServer, landParcelId, sheetId)
    expect(arcgisService.fetchMoorlandIntersection).toHaveBeenCalledWith(mockServer, mockParcelGeometry)

    // Clean up
    jest.restoreAllMocks()
  })
})
