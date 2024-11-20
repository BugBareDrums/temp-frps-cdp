import { calculateIntersectionArea } from './calculate-intersection-area.js';

describe('#calculateIntersectionArea', () => {
  test('should return 0 when no intersection is present', () => {
    const result = calculateIntersectionArea()
    expect(result).toBe(0)
  })
})
