export const hasMinimumParcelArea = (application, ruleConfig) => {
  const {
    landParcel: { area }
  } = application

  const passed = area.toString() >= ruleConfig.minArea.toString()

  return !passed
    ? {
        passed,
        message: `The parcel must have a total area of at least ${ruleConfig.minArea}ha`
      }
    : { passed }
}
