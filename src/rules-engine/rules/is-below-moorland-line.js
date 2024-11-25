import { config } from '~/src/config/index.js'

export async function isBelowMoorlandLine(application) {
  // if (application?.landParcel?.moorlandLineStatus !== 'below') {
  //   return { passed: false, message: 'Land parcel is above the moorland line' }
  // }
  // TODO introduce intersections API call - TBD

  console.log('APPLICATION_PAYLOAD:', JSON.stringify(application.landParcel))
  const url = `http://localhost:${config.get('port')}/land/moorland/intersects?landParcelId=${application.landParcel.id}&sheetId=${application.landParcel.sheetId}`
  console.log('Fetching URL:', url)

  const response = await fetch(url) // Await the fetch response
  console.log('Response Status Code:', response.status) // Log the status code


  const moorland = await response.json()

  console.log('Moorland response:', JSON.stringify(moorland))
  return { passed: moorland.availableArea > 0 }
}
