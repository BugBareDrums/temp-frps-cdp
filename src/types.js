/**
 * @typedef {'landParcel' | 'sssi' | 'monuments' | 'moorland' | 'lfa' } LayerId
 */

/**
 * @typedef {Record<LayerId, number>} Intersections
 */

/**
 * @type {Intersections}
 */
export const blankIntersections = {
  sssi: 0,
  monuments: 0,
  moorland: 0,
  lfa: 0,
  landParcel: 0
}

/**
 * @typedef LandParcel
 * @property {number} area
 * @property {object[]} existingAgreements
 * @property {Intersections} intersections
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
 */
