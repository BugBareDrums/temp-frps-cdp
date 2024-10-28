import {
  findLandParcelController,
  findLandParcelBySbiController,
  findLandCoverController,
  findLandCoverCodeController
} from './controllers/index.js'
/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const land = {
  plugin: {
    name: 'land',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/land/parcel/{landParcelId}',
          ...findLandParcelController
        },
        {
          method: 'GET',
          path: '/land/parcel/sbi/{sbi}', // TODO BS change to /land/parcel/{sbi} or alter lanParcelId above
          ...findLandParcelBySbiController
        },
        {
          method: 'GET',
          path: '/land/cover/{landParcelId}',
          ...findLandCoverController
        },
        {
          method: 'GET',
          path: '/land/code/{landCoverCode}',
          ...findLandCoverCodeController
        }
      ])
    }
  }
}

export { land }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
