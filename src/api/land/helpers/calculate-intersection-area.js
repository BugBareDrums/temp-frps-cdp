import { findLandParcel, fetchMoorlandIntersection } from '~/src/services/arcgis.js';

/**
 * Transforms a geometry in GeoJSON format to the ArcGIS `rings` format.
 * @param {Object} geometry - The GeoJSON geometry.
 * @returns {Object} The ArcGIS `rings`-formatted geometry.
 */
function transformGeometryToRings(geometry) {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) {
    throw new Error('Invalid input geometry');
  }
  return {
    rings: geometry.coordinates,
  };
}

/**
 * Calculates the available area of a land parcel after intersecting with Moorland features.
 * @param {import('@hapi/hapi').Server} server - The server instance.
 * @param {string} landParcelId - The ID of the land parcel.
 * @param {string} sheetId - The sheet ID of the land parcel.
 * @returns {Promise<{ parcelId: string, totalArea: number, availableArea: number }>} An object containing the parcel ID, total intersected area, and available area.
 */
export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  // Fetch the land parcel
  const landParcelResponse = await findLandParcel(server, landParcelId, sheetId);

  if (!landParcelResponse?.features || landParcelResponse.features.length === 0) {
    console.error('No features found for the provided land parcel.');
    return { parcelId: landParcelId, totalArea: 0, availableArea: 0 };
  }

  const parcelFeature = landParcelResponse.features[0];
  const parcelGeometry = parcelFeature?.geometry;
  const parcelArea = parcelFeature?.properties?.GEOM_AREA_SQM;

  if (!parcelGeometry || !parcelGeometry.coordinates || !parcelArea) {
    throw new Error('Invalid geometry or area in land parcel response.');
  }

  // Transform the parcel geometry into the required ArcGIS format
  const transformedParcelGeometry = transformGeometryToRings(parcelGeometry);

  console.log('Fetched and transformed parcel geometry:', JSON.stringify(transformedParcelGeometry, null, 2));

  // Fetch Moorland intersections
  const moorlandResponse = await fetchMoorlandIntersection(server, transformedParcelGeometry);

  if (!moorlandResponse?.features || moorlandResponse.features.length === 0) {
    console.error('No intersecting Moorland features found.');
    return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea };
  }

  console.log('Fetched Moorland intersecting features:', JSON.stringify(moorlandResponse.features, null, 2));

  // Combine all Moorland feature geometries into the `geometries` parameter
  const moorlandGeometries = moorlandResponse.features.map((feature) =>
    transformGeometryToRings(feature.geometry)
  );

  console.log('Transformed Moorland geometries for intersection:', JSON.stringify(moorlandGeometries, null, 2));

  // Make a single intersect API call
  const intersectRequestBody = new URLSearchParams({
    sr: 102009, // Spatial reference
    geometry: JSON.stringify({
      geometryType: 'esriGeometryPolygon',
      geometry: transformedParcelGeometry, // Single land parcel geometry
    }),
    geometries: JSON.stringify({
      geometryType: 'esriGeometryPolygon',
      geometries: moorlandGeometries, // Moorland geometries
    }),
    f: 'json',
  });

  console.log('Intersect API request body:', intersectRequestBody.toString());

  const intersectResponse = await fetch(
    'https://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/intersect',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: intersectRequestBody,
    }
  );

  if (!intersectResponse.ok) {
    throw new Error(`Failed to fetch intersection: ${intersectResponse.statusText}`);
  }

  const intersectResult = await intersectResponse.json();
  const intersectedGeometries = intersectResult.geometries || [];

  console.log('Intersect result:', JSON.stringify(intersectResult, null, 2));
  console.log('Intersect geometries:', JSON.stringify(intersectedGeometries, null, 2));

  if (intersectedGeometries.length === 0) {
    console.error('No valid intersections found.');
    return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea };
  }

  // Calculate areas of the intersected geometries using the Areas and Lengths API
  const areaRequestBody = new URLSearchParams({
    sr: 102009, // Spatial reference
    polygons: JSON.stringify(intersectedGeometries),
    areaUnit: JSON.stringify({ areaUnit: 'esriSquareMeters' }), // Calculate area in square meters
    calculationType: 'preserveShape', // Preserve shape for more accurate calculations
    f: 'json',
  });

  console.log('Areas and Lengths API request body:', areaRequestBody.toString());

  const areaResponse = await fetch(
    'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: areaRequestBody,
    }
  );

  if (!areaResponse.ok) {
    throw new Error(`Failed to calculate areas: ${areaResponse.statusText}`);
  }

  const areaResult = await areaResponse.json();

  console.log('Area calculation result:', JSON.stringify(areaResult, null, 2));

  // Sum up all areas
  const totalArea = (areaResult.areas || []).reduce((sum, area) => sum + area, 0);
  const availableArea = parcelArea - totalArea;

  console.log(`Total intersected area for parcel ${landParcelId}:`, totalArea);
  console.log(`Available area for parcel ${landParcelId}:`, availableArea);

  return {
    parcelId: landParcelId,
    totalArea,
    availableArea,
  };
}
