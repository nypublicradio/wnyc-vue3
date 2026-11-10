// In-memory TTL cache with request coalescing, used to reduce outbound calls to the Simplecast API.
// In production with multiple instances, consider a shared store (e.g. Redis) instead.

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

const MAX_CACHE_ENTRIES = 200
const DEFAULT_FETCH_TIMEOUT_MS = 10_000
const SWEEP_INTERVAL_MS = 60_000

// TTL cache with request coalescing so concurrent lookups for the same key share one fetch.
export class TtlCache<T> {
    private cache = new Map<string, CacheEntry<T>>()
    private inFlight = new Map<string, Promise<T>>()
    private sweepInterval: ReturnType<typeof setInterval>

    constructor(
        private ttlMs: number,
        private shouldCache: (data: T) => boolean = () => true,
        private fetchTimeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
    ) {
        // Entries whose key is never requested again would otherwise sit in memory
        // until the count-based cap evicts them; sweep expired ones on a timer too.
        this.sweepInterval = setInterval(() => this.sweepExpired(), SWEEP_INTERVAL_MS)
    }

    private sweepExpired() {
        const now = Date.now()
        for (const [key, entry] of this.cache) {
            if (now >= entry.expiresAt) {
                this.cache.delete(key)
            }
        }
    }

    /** Stops the background sweep. Useful for tests or graceful shutdown. */
    destroy() {
        clearInterval(this.sweepInterval)
    }

    /**
     * Returns a cached value if fresh, otherwise fetches it, coalescing concurrent
     * requests for the same key so only one outbound call is made at a time.
     */
    async getOrFetch(key: string, fetchFn: () => Promise<T>): Promise<T> {
        const cached = this.cache.get(key)
        if (cached) {
            if (Date.now() < cached.expiresAt) {
                return cached.data
            }
            // Expired entries are never re-requested for the same key until they age
            // out again, so leaving them in place would hold their memory indefinitely.
            this.cache.delete(key)
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

    /** Rejects with a timeout error if the given promise doesn't settle within fetchTimeoutMs. */
    private withTimeout(promise: Promise<T>, key: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(
                () => { reject(new Error(`TtlCache fetch timed out for key: ${key}`)); },
                this.fetchTimeoutMs
            )
            promise.then(
                (value) => { resolve(value); },
                (error) => { reject(error); }
            ).finally(() => { clearTimeout(timer); })
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
