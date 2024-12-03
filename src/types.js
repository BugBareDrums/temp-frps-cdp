/**
 * @typedef {'landParcel' | 'landCover' | 'sssi' | 'monument' | 'moorland' | 'lfa' } LayerId
 */

/**
 * @typedef {Partial<Record<LayerId, number>>} Intersections
 */

/**
 * @typedef { object } Intersection
 * @property { string } type
 * @property { number } percentage
 */

/**
 * @type { Intersections }
 */
export const blankIntersections = {
  sssi: 0,
  monument: 0,
  moorland: 0,
  lfa: 0
}

/**
 * @typedef LandParcel
 * @property {number} area
 * @property {object[]} existingAgreements
 * @property {Intersections} intersections
 */

/**
 * @typedef { object } LandParcelGeometry
 * @property { string } type
 * @property { Array<Array<number[]>> } coordinates
 */

/**
 * @typedef Application
 * @property {number} areaAppliedFor
 * @property {string} actionCodeAppliedFor
 * @property {LandParcel} landParcel
 */

/**
 * @typedef RuleResponse
 * @property {boolean} passed
 * @property {string} [message]
 */
