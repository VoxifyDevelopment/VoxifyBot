import { EventEmitter } from 'events';

/**
 * A simple in-memory cache implementation simulating basic Redis functionality.
 * @extends EventEmitter
 */
export default class FakeRedis extends EventEmitter {
    private cache: Record<string, string>;
    private timeouts: Record<string, NodeJS.Timeout>;
    private connected: boolean = false;

    /**
     * Constructs a new instance of FakeRedis with an empty cache.
     */
    constructor() {
        super();
        this.cache = {};
        this.timeouts = {};
    }

    /**
     * Retrieves the value associated with the given key from the cache.
     * @param key - The key to look up in the cache.
     * @returns A Promise that resolves to the value if the key is found, otherwise resolves to null.
     */
    async get(key: string): Promise<string | null> {
        return this.cache[key] || null;
    }

    /**
     * Sets the value associated with the given key in the cache.
     * @param key - The key to set in the cache.
     * @param value - The value to associate with the key.
     * @returns A Promise that resolves once the value is set in the cache.
     */
    async set(key: string, value: string): Promise<void> {
        this.cache[key] = value;
    }

    /**
     * Deletes the value associated with the given key from the cache.
     * @param key - The key to delete from the cache.
     * @returns A Promise that resolves once the key is deleted from the cache.
     */
    async del(key: string): Promise<void> {
        delete this.cache[key];
    }

    /**
     * Retrieves keys from the cache based on a pattern.
     * @param pattern - The pattern to match keys in the cache.
     * @returns A Promise that resolves to an array of keys matching the pattern.
     */
    async keys(pattern: string): Promise<string[]> {
        const patternRegex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
        return Object.keys(this.cache).filter((key) => patternRegex.test(key));
    }

    /**
     * Checks if a key exists in the cache.
     * @param key - The key to check for existence in the cache.
     * @returns A Promise that resolves to true if the key exists, otherwise resolves to false.
     */
    async exists(key: string): Promise<boolean> {
        return key in this.cache;
    }

    /**
     * Increments the value associated with the given key in the cache.
     * If the key does not exist, it is initialized with the value 0 before incrementing.
     * @param key - The key to increment in the cache.
     * @returns A Promise that resolves to the incremented value.
     */
    async incr(key: string): Promise<number> {
        if (!(key in this.cache)) {
            this.cache[key] = '0';
        }
        const value = parseInt(this.cache[key], 10) + 1;
        this.cache[key] = String(value);
        return value;
    }

    /**
     * Sets the value associated with the given key in the cache with an expiration time (in seconds).
     * @param key - The key to set in the cache.
     * @param value - The value to associate with the key.
     * @param seconds - The expiration time in seconds.
     * @returns A Promise that resolves once the value is set in the cache with the specified expiration time.
     */
    async setEx(key: string, value: string, seconds: number): Promise<void> {
        this.cache[key] = value;

        // Check if there is an existing timeout for the same key
        if (this.timeouts.hasOwnProperty(`${key}_timeout`)) {
            clearTimeout(this.timeouts[`${key}_timeout`]);
            delete this.timeouts[`${key}_timeout`];
        }

        // Set a timeout to delete the key after the specified expiration time
        const timeout = setTimeout(() => {
            this.del(key);
            delete this.timeouts[`${key}_timeout`];
        }, seconds * 1000);

        // Store the timeout in the cache to check for existence later
        this.timeouts[`${key}_timeout`] = timeout;
    }

    /**
     * Connects to the cache, initializing a new cache.
     * Emits a 'connect' event upon successful connection.
     * @returns A Promise that resolves once the connection is established.
     */
    async connect(): Promise<void> {
        if (this.connected) throw new Error('Instance cannot connect twice');
        // Initialize a new cache
        this.cache = {};

        // Emit 'connect' event
        this.emit('connect');
        this.emit('connected');

        this.connected = true;
        // Resolve the promise to indicate successful connection
        return Promise.resolve();
    }

    /**
     * Closes the connection to the cache, clearing the cache.
     * Emits a 'disconnect' event upon successful disconnection.
     * @returns A Promise that resolves once the connection is closed.
     */
    async close(): Promise<void> {
        if (!this.connected) return Promise.resolve();
        // Clear the cache and timeouts
        this.cache = {};

        Object.values(this.timeouts).forEach((to) => {
            clearTimeout(to);
        });
        this.timeouts = {};

        // Emit 'disconnect' event
        this.emit('disconnect');
        this.emit('disconnected');

        // Resolve the promise to indicate successful disconnection
        return Promise.resolve();
    }

    /**
     * Closes the connection to the cache, clearing the cache.
     * Emits a 'disconnect' event upon successful disconnection.
     * @returns A Promise that resolves once the connection is closed.
     */
    async quit(): Promise<void> {
        return this.close();
    }
}
