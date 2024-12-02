export function check(application) {
  const {
    areaAppliedFor,
    landParcel: { area }
  } = application

  const passed = areaAppliedFor === area

  if (!passed) {
    return {
      passed,
      message: `Area applied for (${areaAppliedFor}ha) does not match parcel area (${area}ha)`
    }
  }

  return { passed: true }
}

/**
 * @type {import('../../types.js').Rule}
 */
export const isForWholeParcelArea = { check, requiredDataLayers: [] }
