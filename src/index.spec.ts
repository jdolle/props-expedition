/**
 * Test that exported variables exist
 */

import {explore} from 'index'

describe('index', () => {
  it('exports {explore}', () => {
    expect(explore).not.toBeUndefined()
  })
})
