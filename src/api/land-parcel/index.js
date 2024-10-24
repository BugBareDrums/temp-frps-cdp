import {
  findLandParcelController,
  findLandCoverController
} from './controllers/index.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const landParcel = {
  plugin: {
    name: 'land-parcel',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/land-parcel/{landParcelId}',
          ...findLandParcelController
        },
        {
          method: 'GET',
          path: '/land-cover/{landParcelId}',
          ...findLandCoverController
        }
      ])
    }
  }
}

export { landParcel }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
