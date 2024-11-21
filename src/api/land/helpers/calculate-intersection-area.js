import { findLandParcel, fetchMoorlandIntersection } from '~/src/services/arcgis.js'

/**
 * Calculates the intersection areas of a land parcel with Moorland features.
 * @param {import('@hapi/hapi').Server} server - The server instance.
 * @param {string} landParcelId - The ID of the land parcel.
 * @param {string} sheetId - The sheet ID of the land parcel.
 * @returns {Promise<Array>} An array of intersection geometries.
 */
export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  // Fetch the land parcel
  const landParcelResponse = await findLandParcel(server, landParcelId, sheetId)

  if (!landParcelResponse?.features || landParcelResponse.features.length === 0) {
    console.error('No features found for the provided land parcel.')
    return []
  }

  const parcelGeometry = landParcelResponse.features[0]?.geometry

  if (!parcelGeometry || !parcelGeometry.coordinates) {
    throw new Error('Invalid geometry in land parcel response.')
  }

  console.log('Fetched parcel geometry:', parcelGeometry)

  // Fetch Moorland intersections
  const moorlandResponse = await fetchMoorlandIntersection(server, parcelGeometry)

  if (!moorlandResponse?.features || moorlandResponse.features.length === 0) {
    console.error('No intersecting Moorland features found.')
    return []
  }

  console.log('Fetched Moorland intersecting features:', moorlandResponse.features)

  // Combine all Moorland feature geometries into the `geometries` parameter
  const moorlandGeometries = moorlandResponse.features.map((feature) => feature.geometry)

  // Make a single intersect API call
  const intersectResponse = await fetch(
    'https://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/intersect',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sr: 102009, // Spatial reference
        geometry: JSON.stringify({
          geometryType: 'esriGeometryPolygon',
          geometry: parcelGeometry, // Single land parcel geometry
        }),
        geometries: JSON.stringify({
          geometryType: 'esriGeometryPolygon',
          geometries: moorlandGeometries, // Moorland geometries
        }),
        f: 'json',
      }),
    }
  )

  if (!intersectResponse.ok) {
    throw new Error(`Failed to fetch intersection: ${intersectResponse.statusText}`)
  }

  const intersectResult = await intersectResponse.json()

  console.log('Intersect geometries:', intersectResult.geometries)
  return intersectResult.geometries || []
}
