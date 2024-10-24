import {
  findLandParcelController,
  findLandCoverController
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
          path: '/land/cover/{landParcelId}',
          ...findLandCoverController
        }
      ])
    }
  }
}

export { land }

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
