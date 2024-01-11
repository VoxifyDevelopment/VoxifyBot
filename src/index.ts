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

import 'dotenv/config';

import Logger from './modules/Logger';
import VoxifyTerminal from './terminal/VoxifyTerminal';
import ShardManager from './ShardManager';
import VoxifyClient from './client/VoxifyClient';
import Cache from './caching/Cache';

const out = new Logger('VoxifyBot', '[Main] »');

process.argv.forEach((givenArgument: string) => {
    if (givenArgument.includes('=')) {
        const parts: string[] = givenArgument.split('=');
        if (parts.length < 2) return;
        const key: string = parts[0];
        const value: string = parts[1] || '';
        process.env[key] = value;
    }
});

if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
    out.setDebugging(9);
}

out.debug('Starting VoxifyBot');


if (process.env.NODE_ENV !== 'production') {
    VoxifyTerminal.new(VoxifyClient.new(new Cache()));
}
else {
     let shardManager = ShardManager.new();
     shardManager.spawn().catch((error) => out.error(error));
}

process.on('exit', () => out.info('Bye! Shutdown complete.'));
process.on('SIGINT', async () => {
    process.emit('beforeExit', 0);
    process.exit(0);
});
process.on('SIGTERM', async () => {
    process.emit('beforeExit', 0);
    process.exit(0);
});
