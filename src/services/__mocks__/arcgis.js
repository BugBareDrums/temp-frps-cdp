import {
  mockSarahSingleLandParcelData,
  mockSarahSingleLandCoverData,
  mockSarahMultiLandCoverData
} from './mockData/index.js'

export const findLandParcel = async (server, landParcelId, sheetId) =>
  Promise.resolve(
    mockSarahSingleLandParcelData.find(
      (item) =>
        item.features[0].properties.PARCEL_ID === landParcelId &&
        item.features[0].properties.SHEET_ID === sheetId
    )
  )

export const findLandCover = async (server, landParcelId, sheetId) => {
  if (landParcelId.includes(',')) {
    return mockSarahMultiLandCoverData
  }

  return Promise.resolve(
    mockSarahSingleLandCoverData.find(
      (item) =>
        item.features[0].properties.PARCEL_ID === landParcelId &&
        item.features[0].properties.SHEET_ID === sheetId
    )
  )
}
