import { describe, expect, it } from 'vitest'
import { getEvents, track } from '../src/analytics/track'

describe('analytics', () => {
  it('tracks event', () => {
    track('button_click', { id: 'primary' })
    expect(getEvents().some((e) => e.name === 'button_click')).toBe(true)
  })
})
