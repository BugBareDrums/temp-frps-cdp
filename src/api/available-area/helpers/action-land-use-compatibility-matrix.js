function applyUpdate(newEntries, actionCombinationLandUseCompatibilityMatrix) {
  for (const key in newEntries) {
    actionCombinationLandUseCompatibilityMatrix[key] = newEntries[key]
  }
}
// TODO given below, make an array of all possible combinations of actions for each land use code (result should look like this) ...
// const ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX = {
//   TG01: [['CSAM1', 'CSAM3'], ['CSAM3'], ['CSAM3', 'CSAM1']]
// }

const LAND_USE_ACTION_INDEX = {
  TG01: ['CSAM1', 'CSAM3', 'CSAM2']
}

const ACTION_COMPAT_OBJECT = {
  message: 'success',
  entities: [
    {
      option_code: 'CSAM3',
      option_code_compatibility: 'CSAM1',
      type: 'BASECO',
      description: 'Options are compatible at LAND USE LEVEL',
      year: '2024'
    },
    {
      option_code: 'BLA',
      option_code_compatibility: 'CSAM1',
      type: 'BASECO',
      description: 'Options are compatible at LAND USE LEVEL',
      year: '2024'
    }
  ]
}

const createActionLandUseCompatibilityMatrix = () => {
  let allActionCodes = []
  for (const mapKey in ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX) {
    allActionCodes = allActionCodes.concat(
      ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX[`${mapKey}`].flatMap(
        (combos) => combos
      )
    )
  }
  const actionLandUseMatrix = {}
  new Set(allActionCodes).forEach((actionCode) => {
    actionLandUseMatrix[actionCode] = []
    for (const mapKey in ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX) {
      if (
        ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX[`${mapKey}`]
          .flatMap((combos) => combos)
          .includes(actionCode)
      ) {
        actionLandUseMatrix[actionCode].push(mapKey)
      }
    }
  })
  return actionLandUseMatrix
}

export const actionCombinationLandUseCompatibilityMatrix =
  ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX
export const actionLandUseCompatibilityMatrix =
  createActionLandUseCompatibilityMatrix()
export function updateMatrix(newEntries) {
  applyUpdate(newEntries, this.actionCombinationLandUseCompatibilityMatrix)
}
