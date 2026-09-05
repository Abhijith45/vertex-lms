/**
 * Production-ready in-memory cache with TTL expiration and LRU capacity bounds.
 * Designed for serverless and Node.js environments.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheOptions {
  maxEntries?: number;
  defaultTtlMs?: number;
}

export class SimpleMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private maxEntries: number;
  private defaultTtlMs: number;

  constructor(options: CacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 200;
    this.defaultTtlMs = options.defaultTtlMs ?? 15 * 60 * 1000; // 15 minutes default
  }

  /**
   * Retrieves a cached value if it exists and has not expired.
   * Promotes the entry to maintain LRU order.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh LRU order (delete & re-insert)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  /**
   * Stores a value in the cache with a specific or default TTL.
   * Evicts the oldest entry if capacity is exceeded.
   */
  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    // Delete existing to refresh order
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      // Evict oldest entry (first item in iterator)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, { value, expiresAt });
  }

  /**
   * Checks if a valid, non-expired key exists in the cache.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Deletes a specific key from the cache.
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears all entries from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Returns the count of currently stored items (including any unpruned expired ones).
   */
  get size(): number {
    return this.store.size;
  }
}
