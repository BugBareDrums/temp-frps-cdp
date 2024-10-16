import { failAction } from '~/src/helpers/fail-action.js'

describe('#fail-action', () => {
  test('should throw an error', () => {
    expect(() => failAction({}, null, new Error('test'))).toThrow('test')
  })
})
