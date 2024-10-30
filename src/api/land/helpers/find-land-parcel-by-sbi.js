import fetch from 'node-fetch'
import { arcgisTokenCache } from '~/src/helpers/arcgis-token/index.js'

/**
 * Finds and returns the latest land parcel from ArcGIS for each specified PARCEL_ID.
 * @param { import('@hapi/hapi').Request } request
 * @param { string } sbi
 * @returns {Promise<Array<{}>>}
 */
async function findLandParcelsBySbi({ server, db }, sbi) {
  const { access_token } = await arcgisTokenCache(server).get('arcgis_token')

  // look up SBI in mongo to return a business
  const results = db.collection('farmers').find({ "companies.sbi": sbi });
  const user = await results.toArray();
  const company = user[0].companies.filter(company => company.sbi === sbi)

  // Define the parcel IDs and build the `where` clause
  const parcels = company[0].parcels
  const parcelIds = parcels.map(parcel => parcel.id)

  // Create a single query URL
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/LMS_reference_parcels/FeatureServer/0/query?'
  )
  url.searchParams.set('token', access_token)
  url.searchParams.set('f', 'geojson')
  url.searchParams.set('resultRecordCount', 1) // Set higher limit to capture potential duplicates
  url.searchParams.set('outFields', '*')
  url.searchParams.set('where', `PARCEL_ID IN (${parcelIds.toString()})`)
  url.searchParams.set('orderByFields', 'LAST_REFRESH_DATE DESC') // Order by latest date first

  const response = await fetch(url)
  const data = await response.json()

  // Reduce to ensure only the latest record for each `PARCEL_ID`
  // TODO - Aggregate the features and add the areas
  // const uniqueParcels = data.features.reduce((acc, feature) => {
  //   const parcelId = feature.properties.PARCEL_ID
  //   if (!acc.some(f => f.properties.PARCEL_ID === parcelId)) {
  //     acc.push(feature)
  //   }
  //   return acc
  // }, [])

  // TODO BS call land_cover  ep w parcelId, then call/use land_code to get populate land use
  // TODO BS add farmer tech-demo data to end of response
  // Transform and return only the array of parcels (no wrapping object)
  // getLandCoverClassCode(access_token, data.features[0].properties.PARCEL_ID).then((data) => {
  //   console.log('LAND_COVER_CLASS_CODE::' + JSON.stringify(data, null, 2))
  // })


  return transformParcelData(sbi, parcels, { entity: { features: data.features } })
}

/**
 * Transforms the parcel data from ArcGIS format to a simplified format.
 * @param {Object} json - JSON data with `features` array inside `entity`.
 * @returns {Array} Transformed data for each parcel.
 */
function transformParcelData(sbi, parcels, json) {
  return json.entity.features.map(feature => {
    const properties = feature.properties;
    return {
      id: properties.id,
      sbi,
      parcelId: properties.PARCEL_ID,
      area: (properties.GEOM_AREA_SQM / 10000).toFixed(4), // Convert to hectares
      osSheetId: properties.SHEET_ID,
      validFrom: properties.VALID_FROM,
      validTo: properties.VALID_TO,
      verifiedOn: properties.VERIFIED_ON,
      verificationType: properties.VERIFICATION_TYPE,
      createdOn: properties.CREATED_ON,
      createdBy: properties.CREATED_BY,
      validated: properties.VALIDATED,
      centroidX: properties.CENTROID_X,
      centroidY: properties.CENTROID_Y,
      lastRefreshDate: properties.LAST_REFRESH_DATE,
      wktFormatGeometry: properties.F_geometrywkt,
      shapeArea: properties.Shape__Area,
      shapeLength: properties.Shape__Length,
      landCovers: [],
      agreements: [],
      landUseList: [],
      attributes: {
        moorlandLineStatus: 'below'
      }
    };
  });
}

async function getLandCoverClassCode(access_token, parcelId) {
  
  // Construct the query URL for ArcGIS
  const url = new URL(
    'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Land_Covers/FeatureServer/0/query?'
  );
  url.searchParams.set('where', `PARCEL_ID='${parcelId}'`);
  url.searchParams.set('outFields', 'LAND_COVER_CLASS_CODE');
  url.searchParams.set('resultRecordCount', '1');
  url.searchParams.set('f', 'geojson');
  url.searchParams.set('token', access_token);

  const response = await fetch(url);
  const data = await response.json();

  // Extract and return the LAND_COVER_CLASS_CODE if it exists
  const landCoverClassCode = data.features?.[0]?.properties?.LAND_COVER_CLASS_CODE || null;
  return { LAND_COVER_CLASS_CODE: landCoverClassCode };
}


export { findLandParcelsBySbi }
