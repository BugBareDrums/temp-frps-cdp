import { config } from '~/src/config/index.js';

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

  if (!response.ok) {
    console.error('Failed to fetch moorland data:', response.statusText)
    return { passed: false, message: `Fetch failed with status: ${response.status}` }
  }

  const moorland = await response.json(); // Parse the response body as JSON
  console.log('Moorland response:', JSON.stringify(moorland))
  return { passed: true }
}
