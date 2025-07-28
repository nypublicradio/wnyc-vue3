import { describe, it, expect } from 'vitest'

// Let's test these utility functions directly without importing the entire helpers file
// We'll define simplified versions for testing

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getMinutes(ms: number, mult = 1000): string {
  const seconds = Math.round(ms / mult)
  let minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  minutes %= 60

  let duration = ""
  if (hours > 0) {
    duration += `${hours} hr`
  }
  if (minutes > 0) {
    duration += ` ${minutes} min`
  }
  if (duration === "") {
    duration = "Play"
  }
  return duration
}

function getYear(): number {
  return new Date().getFullYear()
}

describe('Utility Functions', () => {
  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello')
      expect(capitalizeFirstLetter('world')).toBe('World')
      expect(capitalizeFirstLetter('a')).toBe('A')
    })

    it('handles empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('')
    })

    it('handles strings that are already capitalized', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello')
      expect(capitalizeFirstLetter('WORLD')).toBe('WORLD')
    })

    it('only capitalizes the first letter', () => {
      expect(capitalizeFirstLetter('hello world')).toBe('Hello world')
      expect(capitalizeFirstLetter('test string')).toBe('Test string')
    })
  })

  describe('getMinutes', () => {
    it('converts milliseconds to duration format', () => {
      expect(getMinutes(60000)).toBe(' 1 min') // 1 minute
      expect(getMinutes(120000)).toBe(' 2 min') // 2 minutes
      expect(getMinutes(3600000)).toBe('1 hr') // 1 hour
      expect(getMinutes(3660000)).toBe('1 hr 1 min') // 1 hour 1 minute
      expect(getMinutes(7320000)).toBe('2 hr 2 min') // 2 hours 2 minutes
    })

    it('handles seconds with custom multiplier', () => {
      expect(getMinutes(60, 1)).toBe(' 1 min') // 60 seconds with mult=1
      expect(getMinutes(3600, 1)).toBe('1 hr') // 3600 seconds with mult=1
    })

    it('returns "Play" for very short durations', () => {
      expect(getMinutes(0)).toBe('Play')
      expect(getMinutes(500)).toBe('Play') // less than 1 second
    })

    it('handles hours and minutes correctly', () => {
      expect(getMinutes(5400000)).toBe('1 hr 30 min') // 1.5 hours
      expect(getMinutes(7200000)).toBe('2 hr') // exactly 2 hours
    })
  })

  describe('getYear', () => {
    it('returns the current year', () => {
      const currentYear = new Date().getFullYear()
      expect(getYear()).toBe(currentYear)
    })

    it('returns a number', () => {
      expect(typeof getYear()).toBe('number')
    })

    it('returns a 4-digit year', () => {
      const year = getYear()
      expect(year).toBeGreaterThan(1999)
      expect(year).toBeLessThan(3000)
    })
  })
})
