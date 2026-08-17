import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TtlCache } from '../../server/utils/simplecastCache'

describe('TtlCache', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns cached data on a subsequent call within the TTL window', async () => {
        const cache = new TtlCache<string>(1000)
        const fetchFn = vi.fn().mockResolvedValue('value')

        const first = await cache.getOrFetch('key', fetchFn)
        const second = await cache.getOrFetch('key', fetchFn)

        expect(first).toBe('value')
        expect(second).toBe('value')
        expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('re-fetches once the TTL has expired', async () => {
        const cache = new TtlCache<string>(1000)
        const fetchFn = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')

        await cache.getOrFetch('key', fetchFn)
        vi.advanceTimersByTime(1001)
        const result = await cache.getOrFetch('key', fetchFn)

        expect(result).toBe('second')
        expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('coalesces concurrent requests for the same key into a single fetch', async () => {
        const cache = new TtlCache<string>(1000)
        let resolveFetch: (value: string) => void = () => { /* replaced once the Promise executor below runs */ }
        const fetchFn = vi.fn(() => new Promise<string>((resolve) => { resolveFetch = resolve }))

        const first = cache.getOrFetch('key', fetchFn)
        const second = cache.getOrFetch('key', fetchFn)
        resolveFetch('value')

        const [firstResult, secondResult] = await Promise.all([first, second])

        expect(firstResult).toBe('value')
        expect(secondResult).toBe('value')
        expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('does not cache results rejected by the shouldCache predicate', async () => {
        const cache = new TtlCache<{ error?: boolean }>(1000, (result) => !result.error)
        const fetchFn = vi.fn().mockResolvedValue({ error: true })

        await cache.getOrFetch('key', fetchFn)
        await cache.getOrFetch('key', fetchFn)

        expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('rejects and clears inFlight when fetch exceeds the timeout', async () => {
        const cache = new TtlCache<string>(1000, () => true, 5000)
        const fetchFn = vi.fn(() => new Promise<string>(() => { /* never resolves */ }))

        const promise = cache.getOrFetch('key', fetchFn)
        vi.advanceTimersByTime(5000)

        await expect(promise).rejects.toThrow('TtlCache fetch timed out for key: key')
        // inFlight is cleared, so the next call triggers a new fetch
        expect(fetchFn).toHaveBeenCalledTimes(1)
        const retryFn = vi.fn().mockResolvedValue('recovered')
        const result = await cache.getOrFetch('key', retryFn)
        expect(result).toBe('recovered')
    })
})

