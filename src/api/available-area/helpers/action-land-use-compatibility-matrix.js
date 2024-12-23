function applyUpdate(newEntries, actionCombinationLandUseCompatibilityMatrix) {
  for (const key in newEntries) {
    actionCombinationLandUseCompatibilityMatrix[key] = newEntries[key]
  }
}

// TODO - given list of actions compatible w land use code, and action compatibility matrix,
//  create an algorithm to generate matrix of possible combinations instead of hardcoding combinations
const ACTION_COMBO_LAND_USE_COMPATIBILITY_MATRIX = {
  AC32: [
    ['CSAM3'],
    ['CSAM3', 'SAM1'],
    ['CSAM3', 'CSAM1'],
    ['SAM1', 'SAM2'],
    ['SAM1'],
    ['SAM2'],
    ['AB3'],
    ['SAM1', 'AB3'],
    ['CSAM1', 'SAM2'],
    ['CSAM1'],
    ['CSAM1', 'AB3'],
    ['CSAM2'],
    ['CSAM2', 'SAM1'],
    ['CSAM2', 'CSAM1'],
    ['CSAM2', 'AB3'],
    ['CSAM2', 'SAM1', 'CSAM1'],
    ['CSAM2', 'SAM1', 'AB3'],
    ['CSAM2', 'CSAM1', 'AB3'],
    ['CLIG3'],
    ['CLIG3', 'SAM1'],
    ['CLIG3', 'CSAM1'],
    ['CLIG3', 'GRH7']
  ],
  PG01: [
    ['CSAM3'],
    ['CSAM3', 'SAM1'],
    ['CSAM3', 'CSAM1'],
    ['SAM1', 'SAM3'],
    ['SAM1', 'LIG1'],
    ['SAM1', 'GRH1'],
    ['SAM1'],
    ['SAM3'],
    ['LIG1'],
    ['GRH1'],
    ['CSAM1', 'SAM3'],
    ['CSAM1', 'LIG1'],
    ['CSAM1', 'GRH1'],
    ['CSAM1'],
    ['CLIG3'],
    ['CLIG3', 'SAM1'],
    ['CLIG3', 'CSAM1'],
    ['CLIG3', 'GRH7']
  ],
  TG01: [
    ['AB3'],
    ['AB3', 'CSAM1'],
    ['AB3', 'SAM1'],
    ['CSAM1'],
    ['CSAM1', 'AB3'],
    ['CSAM1', 'CSAM2'],
    ['CSAM1', 'CSAM3'],
    ['CSAM1', 'LIG1'],
    ['CSAM1', 'SAM2'],
    ['CSAM1', 'SAM3'],
    ['CSAM2'],
    ['CSAM2', 'SAM1'],
    ['CSAM3'],
    ['CSAM3', 'CSAM1'],
    ['CSAM3', 'SAM1'],
    ['LIG1'],
    ['LIG1', 'CSAM1'],
    ['LIG1', 'SAM1'],
    ['SAM1'],
    ['SAM1', 'AB3'],
    ['SAM1', 'CSAM2'],
    ['SAM1', 'CSAM3'],
    ['SAM1', 'LIG1'],
    ['SAM1', 'SAM2'],
    ['SAM1', 'SAM3'],
    ['SAM2'],
    ['SAM2', 'CSAM1'],
    ['SAM2', 'SAM1'],
    ['SAM3'],
    ['SAM3', 'CSAM1'],
    ['SAM3', 'SAM1'],
    ['CLIG3'],
    ['CLIG3', 'SAM1'],
    ['CLIG3', 'CSAM1'],
    ['CLIG3', 'GRH7']
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
