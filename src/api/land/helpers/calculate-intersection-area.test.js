import { calculateIntersectionArea } from './calculate-intersection-area.js';
import * as arcgisService from '~/src/services/arcgis.js';

describe('#calculateIntersectionArea', () => {
  test('should call findLandParcel and return 100 as a placeholder area', async () => {
    // Arrange
    const mockServer = {}
    const landParcelId = '1234'
    const sheetId = '5678'
    const mockGeometry = {
      type: 'Polygon',
      coordinates: [
        [
          [-1, 53],
          [-2, 53],
          [-2, 54],
          [-1, 54],
          [-1, 53]
        ]
      ]
    }

    jest.spyOn(arcgisService, 'findLandParcel').mockResolvedValueOnce({
      features: [{ geometry: mockGeometry }]
    })

    // Act
    const result = await calculateIntersectionArea(
      mockServer,
      landParcelId,
      sheetId
    )

    // Assert
    expect(result).toBe(100)
    expect(arcgisService.findLandParcel).toHaveBeenCalledWith(mockServer, landParcelId, sheetId)

    // Clean up
    jest.restoreAllMocks()
  })
})
