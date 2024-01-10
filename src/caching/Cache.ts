/**
 * Copyright (c) 2023 - present | sanguine6660 <sanguine6660@gmail.com>
 * Copyright (c) 2023 - present | voxify.dev <contact@voxify.dev>
 * Copyright (c) 2023 - present | voxify.dev team and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { RedisClientType, createClient } from 'redis';
import Logger from '../modules/Logger';
import FakeRedis from './redis/FakeRedis';

export default class Cache {
    private out: Logger;
    redis: RedisClientType | FakeRedis;

    constructor() {
        this.out = new Logger('VoxifyBot', '[Cache] »');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }

        if (process.env.REDIS_CONNECTION) {
            this.redis = createClient({
                url: process.env.REDIS_CONNECTION
            });
        } else {
            this.redis = new FakeRedis();
        }

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
