import { RedisClientType, createClient } from 'redis';
import Logger from '../modules/Logger';

export default class Cache {
    private out: Logger;
    redis: RedisClientType;

    constructor() {
        this.out = new Logger('VoxifyBot', '[Cache] »');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }
        this.redis = createClient({
            url: process.env.REDIS_CONNECTION
        });
        this.redis.on('error', (error) => {
            this.out.error('Redis client error:', error);
        });
        this.redis.on('connect', () => {
            this.out.debug('Connected to Redis server');
        });

        this.redis.on('disconnect', () => {
            this.out.debug('Disconnected from Redis server');
        });

        this.redis.connect();
        process.on('beforeExit', async () => {
            this.redis.quit();
        });
    }
}
