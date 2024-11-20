import {
  findLandParcel,
  fetchMoorlandIntersection
} from '~/src/services/arcgis.js'

export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  const landParcelResponse = await findLandParcel(server, landParcelId, sheetId)

  if (
    !landParcelResponse?.features ||
    landParcelResponse.features.length === 0
  ) {
    console.error('No features found for the provided land parcel.')
    return 0
  }

  const parcelGeometry = landParcelResponse.features[0]?.geometry

  if (!parcelGeometry?.coordinates) {
    console.error('Invalid geometry in land parcel response.')
    return 0
  }

  console.log('Fetched parcel geometry:', parcelGeometry)

  const moorlandResponse = await fetchMoorlandIntersection(server, parcelGeometry)

  if (!moorlandResponse?.features || moorlandResponse.features.length === 0) {
    console.error('No intersecting Moorland features found.')
    return 0
  }

  console.log('Fetched Moorland intersecting features:', moorlandResponse.features)

  // Placeholder: Aggregate intersection areas if needed
  const intersectionArea = moorlandResponse.features.length * 100

  return intersectionArea
}

// TODO get LP polygon by Id/SheetId - see arcgis.js
// TODO get polygons that intersect from Moorland server - see arcgis.js need new function there, needs a POST request there
// TODO use above in intersect api to get intersection polygon - see arcgis.js

// TODO use areas and lengths from geometry server to calculate area of intersection polygon(s) - see arcgis.js need new function there
