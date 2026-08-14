// In-memory TTL cache with request coalescing, used to reduce outbound calls to the Simplecast API.
// In production with multiple instances, consider a shared store (e.g. Redis) instead.

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

const MAX_CACHE_ENTRIES = 200
const DEFAULT_FETCH_TIMEOUT_MS = 10_000

// TTL cache with request coalescing so concurrent lookups for the same key share one fetch.
export class TtlCache<T> {
    private cache = new Map<string, CacheEntry<T>>()
    private inFlight = new Map<string, Promise<T>>()

    constructor(
        private ttlMs: number,
        private shouldCache: (data: T) => boolean = () => true,
        private fetchTimeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
    ) { /* parameter properties above handle field assignment */ }

    /**
     * Returns a cached value if fresh, otherwise fetches it, coalescing concurrent
     * requests for the same key so only one outbound call is made at a time.
     */
    async getOrFetch(key: string, fetchFn: () => Promise<T>): Promise<T> {
        const cached = this.cache.get(key)
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data
        }

        const pending = this.inFlight.get(key)
        if (pending) {
            return pending
        }

        const promise = this.withTimeout(fetchFn(), key).finally(() => this.inFlight.delete(key))
        this.inFlight.set(key, promise)

        const data = await promise
        if (this.shouldCache(data)) {
            this.set(key, data)
        }
        return data
    }

    private withTimeout(promise: Promise<T>, key: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(
                () => reject(new Error(`TtlCache fetch timed out for key: ${key}`)),
                this.fetchTimeoutMs
            )
            promise.then(resolve, reject).finally(() => clearTimeout(timer))
        })
    }

    private set(key: string, data: T) {
        // Evict the oldest entry when at capacity to bound memory growth
        if (this.cache.size >= MAX_CACHE_ENTRIES && !this.cache.has(key)) {
            const oldestKey = this.cache.keys().next().value
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey)
            }
        }
        this.cache.set(key, { data, expiresAt: Date.now() + this.ttlMs })
    }
}
