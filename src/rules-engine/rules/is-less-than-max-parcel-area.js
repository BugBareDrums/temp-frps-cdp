export const isLessThanMaximumParcelArea = (application, ruleConfig) => {
  const {
    landParcel: { area }
  } = application

  const passed = area.toString() < ruleConfig.maxArea.toString()

  return !passed
    ? {
        passed,
        message: `The parcel must have a maximum total area of ${ruleConfig.maxArea}ha`
      }
    : { passed }
}
