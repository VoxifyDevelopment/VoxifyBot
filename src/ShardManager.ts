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

import VoxifyTerminal from './terminal/VoxifyTerminal';
import { ShardingManager } from 'discord.js';

export default class ShardManager extends ShardingManager {
    terminal: VoxifyTerminal;
    constructor(terminal: VoxifyTerminal) {
        if (process.env.NODE_ENV === 'production')
            throw new Error('You can only use sharding in "NODE_ENV=production" mode');
        super('./client/index.js');
        this.terminal = terminal;
    }

    static new(terminal: VoxifyTerminal): ShardManager {
        return new ShardManager(terminal);
    }
}
