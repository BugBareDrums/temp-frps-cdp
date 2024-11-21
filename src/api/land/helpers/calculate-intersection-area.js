import { findLandParcel, fetchMoorlandIntersection } from '~/src/services/arcgis.js';

/**
 * Transforms a geometry in GeoJSON format to the ArcGIS `rings` format.
 * Ensures that each ring is properly closed.
 * @param {Object} geometry - The GeoJSON geometry.
 * @returns {Object} The ArcGIS `rings`-formatted geometry.
 */
function transformGeometryToRings(geometry) {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) {
    throw new Error('Invalid input geometry');
  }
  return {
    rings: geometry.coordinates.map((ring) => {
      if (
        ring[0][0] !== ring[ring.length - 1][0] ||
        ring[0][1] !== ring[ring.length - 1][1]
      ) {
        return [...ring, ring[0]]; // Ensure the ring is closed
      }
      return ring;
    }),
  };
}

export async function calculateIntersectionArea(server, landParcelId, sheetId) {
  try {
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

    console.log('Transformed parcel geometry:', JSON.stringify(transformedParcelGeometry, null, 2));

    // Fetch Moorland intersections
    const moorlandResponse = await fetchMoorlandIntersection(server, transformedParcelGeometry);

    if (!moorlandResponse?.features || moorlandResponse.features.length === 0) {
      console.error('No intersecting Moorland features found.');
      return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea };
    }

    const moorlandGeometries = moorlandResponse.features.map((feature) =>
      transformGeometryToRings(feature.geometry)
    );

    // Make the intersect API call
    const intersectRequestBody = new URLSearchParams({
      sr: 4326, // Match the spatial reference to longitude/latitude
      geometry: JSON.stringify({
        geometryType: 'esriGeometryPolygon',
        geometry: transformedParcelGeometry,
      }),
      geometries: JSON.stringify({
        geometryType: 'esriGeometryPolygon',
        geometries: moorlandGeometries,
      }),
      f: 'json',
    });

    const intersectResponse = await fetch(
      'https://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/intersect',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: intersectRequestBody,
      }
    );

    if (!intersectResponse.ok) {
      throw new Error(`Failed to fetch intersection: ${intersectResponse.statusText}`);
    }

    const intersectResult = await intersectResponse.json();
    const intersectedGeometries = intersectResult.geometries || [];

    if (intersectedGeometries.length === 0) {
      console.error('No valid intersections found.');
      return { parcelId: landParcelId, totalArea: 0, availableArea: parcelArea };
    }

    // Calculate areas of the intersected geometries using the Areas and Lengths API
    const areaRequestBody = new URLSearchParams({
      sr: 4326, // Match the spatial reference to longitude/latitude
      polygons: JSON.stringify(intersectedGeometries),
      areaUnit: JSON.stringify({ areaUnit: 'esriSquareMeters' }),
      calculationType: 'preserveShape',
      f: 'json',
    });

    const areaResponse = await fetch(
      'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: areaRequestBody,
      }
    );

    if (!areaResponse.ok) {
      throw new Error(`Failed to calculate areas: ${areaResponse.statusText}`);
    }

    const areaResult = await areaResponse.json();

    const totalArea = (areaResult.areas || []).reduce((sum, area) => sum + area, 0);
    const availableArea = parcelArea - totalArea;

    return {
      parcelId: landParcelId,
      totalArea,
      availableArea,
    };
  } catch (error) {
    console.error(`Error in calculateIntersectionArea: ${error.message}`);
    return { parcelId: landParcelId, totalArea: 0, availableArea: 0 };
  }
}
