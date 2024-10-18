function isCompatibleWithAllCodes(
  actionCompatibilityMatrix,
  newCode,
  existingCodes
) {
  const compatibleCodes = existingCodes.filter((code) =>
    actionCompatibilityMatrix[code].includes(newCode)
  )
  return compatibleCodes.length === existingCodes.length
}

/**
 *
 * @satisfies {Partial<ServerRoute>}
 */
const availableAreaController = {
  /**
   * @param { import('@hapi/hapi').Request & MongoDBPlugin } request
   * @param { import('@hapi/hapi').ResponseToolkit } h
   * @returns { import('@hapi/hapi').ResponseObject }
   */
  handler: (request, h) => {
    if (request.params == null) {
      return h.response({ area: 0.0 }).code(200)
    }

    const { applicationFor, landParcel, actionCompatibilityMatrix } =
      request.params
    let area = landParcel.area ?? 0.0

    const compatibleAgreementGroups = []

    for (const agreement of landParcel.existingAgreements ?? []) {
      if (compatibleAgreementGroups.length === 0) {
        const group = { area: agreement.area, codes: [agreement.code] }
        compatibleAgreementGroups.push(group)
        continue
      }

      const compatibleGroup = compatibleAgreementGroups.find((group) =>
        isCompatibleWithAllCodes(
          actionCompatibilityMatrix,
          agreement.code,
          group.codes
        )
      )

      if (compatibleGroup) {
        if (agreement.area === compatibleGroup.area) {
          compatibleGroup.codes.push(agreement.code)
        } else if (agreement.area < compatibleGroup.area) {
          compatibleGroup.area -= agreement.area
          compatibleAgreementGroups.push({
            area: agreement.area,
            codes: [...compatibleGroup.codes, agreement.code]
          })
        } else if (agreement.area > compatibleGroup.area) {
          compatibleGroup.codes.push(agreement.code)
          compatibleAgreementGroups.push({
            area: agreement.area - compatibleGroup.area,
            codes: [agreement.code]
          })
        }
      } else {
        compatibleAgreementGroups.push({
          area: agreement.area,
          codes: [agreement.code]
        })
      }
    }

    for (const group of compatibleAgreementGroups ?? []) {
      if (
        !isCompatibleWithAllCodes(
          actionCompatibilityMatrix,
          applicationFor,
          group.codes
        )
      ) {
        area -= group.area
      }
    }

    return h.response({ area }).code(200)
  }
}

export { availableAreaController }

/**
 * @import { ServerRoute} from '@hapi/hapi'
 * @import { MongoDBPlugin } from '~/src/helpers/mongodb.js'
 */
