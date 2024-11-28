/**
 *
 * @param { Application } application
 * @returns { RuleResponse }> }
 */
export function isForWholeParcelArea(application) {
  const {
    areaAppliedFor,
    landParcel: { area }
  } = application

  const passed = areaAppliedFor.toString() === area.toString()

  if (!passed) {
    return {
      passed,
      message: `Area applied for (${areaAppliedFor}ha) does not match parcel area (${area}ha)`
    }
  }

  return { passed: true }
}

/** @import { Application, RuleResponse } from '~/src/types.js' */
