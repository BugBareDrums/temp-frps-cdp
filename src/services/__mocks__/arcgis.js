import { mockLandParcelData, mockLandCoverData } from './mockData/index.js'

export const findLandParcel = async (server, landParcelId, sheetId) =>
  Promise.resolve(
    mockLandParcelData.find(
      (item) =>
        item.features[0].properties.PARCEL_ID === landParcelId &&
        item.features[0].properties.SHEET_ID === sheetId
    )
  )

export const findLandCover = async (server, landParcelId, sheetId) =>
  Promise.resolve(
    mockLandCoverData.find(
      (item) =>
        item.features[0].properties.PARCEL_ID === landParcelId &&
        item.features[0].properties.SHEET_ID === sheetId
    )
  )
