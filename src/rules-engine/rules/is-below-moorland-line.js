export function isBelowMoorlandLine(application) {
  if (application?.landParcel?.moorlandLineStatus !== 'below') {
    return { passed: false, message: 'Land parcel is above the moorland line' }
  }
  // TODO introduce intersections API call - TBD
  // const moorland = await calculateIntersectionArea(request.server, '1040', 'SK0140')
  // console.log('Moorland response:', JSON.stringify(moorland))
  return { passed: true }
}
