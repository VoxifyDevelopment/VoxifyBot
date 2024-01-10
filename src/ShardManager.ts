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

import Logger from './modules/Logger';
import { ShardingManager } from 'discord.js';

export default class ShardManager extends ShardingManager {
    out: Logger;
    constructor() {
        if (process.env.NODE_ENV !== 'production')
            throw new Error('You can only use sharding in "NODE_ENV=production" mode');
        super('./client/index.js', { mode: 'process' });
        this.out = new Logger('VoxifyBot', '[ShardManager] »');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }

        this.on('shardCreate', (shard) => {
            this.out.info(`Shard ${shard.id} created...`);

            // set stdout and stderr to main process
            if (shard.process) {
                shard.process.stdout = process.stdout;
                shard.process.stderr = process.stderr;
            }
        });

        process.on('beforeExit', async () => {
            this.shards.forEach((shard) => {
                shard.kill();
            });
        });
    }

    static new(): ShardManager {
        return new ShardManager();
    }
}
