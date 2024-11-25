import {
  findLandParcel,
  fetchMoorlandIntersection
} from '~/src/services/arcgis.js'

export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  try {
    const landParcelResponse = await findLandParcel(
      server,
      landParcelId,
      sheetId
    )
    if (
      !landParcelResponse?.features ||
      landParcelResponse.features.length === 0
    ) {
      return { parcelId: landParcelId, totalArea: 0, availableArea: 0 }
    }

    const parcelFeature = landParcelResponse.features[0] // at the moment we are only using the first feature of the parcel for POC
    const rawParcelGeometry = parcelFeature?.geometry
    const parcelArea = parcelFeature?.properties?.GEOM_AREA_SQM

    if (!rawParcelGeometry?.coordinates || !parcelArea) {
      throw new Error('Invalid geometry or area in land parcel response.')
    }

    const parcelGeometry = transformGeometryToRings(rawParcelGeometry)
    const moorlandIntersections = await fetchMoorlandIntersection(
      server,
      parcelGeometry
    )

    if (
      !moorlandIntersections?.features ||
      moorlandIntersections.features.length === 0
    ) {
      return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea }
    }

    const moorlandGeometries = moorlandIntersections.features.map((feature) =>
      transformGeometryToRings(feature.geometry)
    )
    const intersectResponse = await calculateIntersection(
      parcelGeometry,
      moorlandGeometries
    )

    if (!intersectResponse.ok) {
      throw new Error(
        `Failed to fetch intersection: ${intersectResponse.statusText}`
      )
    }

    const intersectResult = await intersectResponse.json()
    const intersectedGeometries = intersectResult.geometries || []

    if (intersectedGeometries.length === 0) {
      return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea }
    }
    const areaResponse = await calculateAreas(intersectedGeometries)

    if (!areaResponse.ok) {
      throw new Error(`Failed to calculate areas: ${areaResponse.statusText}`)
    }

    const areaResult = await areaResponse.json()

    // may have error margin due to maximum number of vertices per geometry of public API i.e.snapping
    const totalArea = (areaResult.areas || []).reduce(
      (sum, area) => sum + area,
      0
    )
    const availableArea = parcelArea - totalArea

    return {
      parcelId: landParcelId,
      totalArea,
      availableArea
    }
  } catch (error) {
    return { parcelId: landParcelId, totalArea: 0, availableArea: 0 }
  }
}

function transformGeometryToRings(geometry) {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) {
    throw new Error('Invalid input geometry')
  }
  return {
    rings: geometry.coordinates.map((ring) => {
      if (
        ring[0][0] !== ring[ring.length - 1][0] ||
        ring[0][1] !== ring[ring.length - 1][1]
      ) {
        return [...ring, ring[0]] // Ensure the ring is closed
      }
      return ring
    })
  }
}

async function calculateIntersection(
  arcGisFormatParcelGeometry,
  moorlandGeometries
) {
  const intersectRequestBody = new URLSearchParams({
    sr: '4326', // Match the spatial reference to longitude/latitude
    geometry: JSON.stringify({
      geometryType: 'esriGeometryPolygon',
      geometry: arcGisFormatParcelGeometry
    }),
    geometries: JSON.stringify({
      geometryType: 'esriGeometryPolygon',
      geometries: moorlandGeometries
    }),
    f: 'json'
  })

  const intersectResponse = await fetch(
    'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/intersect',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: intersectRequestBody
    }
  )
  return intersectResponse
}

async function calculateAreas(intersectedGeometries) {
  const areaRequestBody = new URLSearchParams({
    sr: '4326', // Match the spatial reference to longitude/latitude
    polygons: JSON.stringify(intersectedGeometries),
    areaUnit: JSON.stringify({ areaUnit: 'esriSquareMeters' }),
    calculationType: 'preserveShape',
    f: 'json'
  })

  const areaResponse = await fetch(
    'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: areaRequestBody
    }
  )
  return areaResponse
}
