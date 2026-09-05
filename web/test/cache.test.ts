import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { SimpleMemoryCache } from "../lib/cache.ts";

describe("SimpleMemoryCache - Basic Operations", () => {
  test("stores and retrieves values", () => {
    const cache = new SimpleMemoryCache<string>();
    cache.set("key1", "value1");
    assert.equal(cache.get("key1"), "value1");
    assert.equal(cache.has("key1"), true);
  });

  test("returns undefined for non-existent keys", () => {
    const cache = new SimpleMemoryCache<string>();
    assert.equal(cache.get("missing"), undefined);
    assert.equal(cache.has("missing"), false);
  });

  test("deletes specific key", () => {
    const cache = new SimpleMemoryCache<number>();
    cache.set("num", 42);
    assert.equal(cache.delete("num"), true);
    assert.equal(cache.get("num"), undefined);
    assert.equal(cache.has("num"), false);
  });

  test("clears all keys", () => {
    const cache = new SimpleMemoryCache<string>();
    cache.set("a", "1");
    cache.set("b", "2");
    assert.equal(cache.size, 2);
    cache.clear();
    assert.equal(cache.size, 0);
    assert.equal(cache.get("a"), undefined);
  });
});

describe("SimpleMemoryCache - TTL Expiration", () => {
  test("expires items after specified TTL", async () => {
    const cache = new SimpleMemoryCache<string>();
    // Set with 40ms TTL
    cache.set("ephemeral", "hello", 40);
    assert.equal(cache.get("ephemeral"), "hello");

    // Wait 60ms
    await new Promise((resolve) => setTimeout(resolve, 60));

    assert.equal(cache.get("ephemeral"), undefined);
    assert.equal(cache.has("ephemeral"), false);
  });

  test("retains items within TTL window", async () => {
    const cache = new SimpleMemoryCache<string>();
    cache.set("fresh", "data", 500);

    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(cache.get("fresh"), "data");
  });
});

describe("SimpleMemoryCache - Capacity and LRU Eviction", () => {
  test("evicts least recently used item when maxEntries is exceeded", () => {
    const cache = new SimpleMemoryCache<string>({ maxEntries: 3 });

    cache.set("item1", "val1");
    cache.set("item2", "val2");
    cache.set("item3", "val3");
    assert.equal(cache.size, 3);

    // Access item1 to make it most recently used (order now: item2, item3, item1)
    cache.get("item1");

    // Add item4: should evict item2 (the oldest unaccessed item)
    cache.set("item4", "val4");
    assert.equal(cache.size, 3);

    assert.equal(cache.get("item2"), undefined, "item2 should have been evicted");
    assert.equal(cache.get("item1"), "val1");
    assert.equal(cache.get("item3"), "val3");
    assert.equal(cache.get("item4"), "val4");
  });

  test("updating an existing key refreshes its value without eviction", () => {
    const cache = new SimpleMemoryCache<string>({ maxEntries: 2 });
    cache.set("x", "1");
    cache.set("y", "2");

    cache.set("x", "updated-1");
    assert.equal(cache.size, 2);
    assert.equal(cache.get("x"), "updated-1");
    assert.equal(cache.get("y"), "2");
  });
});
