import { config } from '~/src/config/index.js'

export async function isBelowMoorlandLine(application) {
  const url = `http://localhost:${config.get('port')}/land/moorland/intersects?landParcelId=${application.landParcel.id}&sheetId=${application.landParcel.sheetId}`
  const response = await fetch(url)
  const moorland = await response.json()
  let passed = false
  if (moorland.availableArea > 0) {
    passed = true
  }
  return { passed }
}
