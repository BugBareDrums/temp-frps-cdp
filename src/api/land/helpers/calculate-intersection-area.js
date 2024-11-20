import { findLandParcel } from '~/src/services/arcgis.js';

export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  const landParcelResponse = await findLandParcel(server, landParcelId, sheetId)
  if (
    !landParcelResponse?.features ||
    landParcelResponse.features.length === 0
  ) {
    return 0
  }
  const parcelGeometry = landParcelResponse.features[0].geometry
  console.log('Fetched parcel geometry:', parcelGeometry)
  const area = 100
  return area
}

// TODO get LP polygon by Id/SheetId - see arcgis.js
// TODO get polygons that intersect from Moorland server - see arcgis.js need new function there, needs a POST request there
// TODO use above in intersect api to get intersection polygon - see arcgis.js
// TODO use areas and lengths from geometry server to calculate area of intersection polygon - see arcgis.js need new function there
