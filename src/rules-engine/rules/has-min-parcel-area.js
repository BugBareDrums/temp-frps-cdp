export const hasMinimumParcelArea = (application, ruleConfig) => {
  const {
    landParcel: { area }
  } = application

  const passed = parseFloat(area) >= parseFloat(ruleConfig.minArea)

  return !passed
    ? {
        passed,
        message: `The parcel must have a total area of at least ${ruleConfig.minArea}ha`
      }
    : { passed }
}
