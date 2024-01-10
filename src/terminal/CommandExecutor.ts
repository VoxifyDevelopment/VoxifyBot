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

import ShardManager from '../ShardManager';
import VoxifyClient from '../client/VoxifyClient';
import Terminal from './VoxifyTerminal';

export interface Command {
    name: string;
    args: string[];
    terminal: Terminal;
    shardManager?: ShardManager;
    bot?: VoxifyClient;
}

export interface CommandExecutor {
    name: string;
    aliases: string[];
    description: string;
    help?: string[];
    run: (command: Command) => Promise<boolean>;
}

export default CommandExecutor;
