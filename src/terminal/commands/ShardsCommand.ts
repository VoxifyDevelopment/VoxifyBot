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

import CommandExecutor, { Command } from '../CommandExecutor';

export default class ShardsCommand implements CommandExecutor {
    name: string = 'shards';
    aliases: string[] = [];
    description: string = 'Shows a list of available shards.';

    async run(command: Command) {
        const { terminal, name, args, bot, shardManager } = command;
        if (shardManager) {
            return true;
        }
        terminal
            .getLogger()
            .log(`Sharding not enabled... Running ${bot?.user?.username} ID: ${bot?.user?.id}`);
        return true;
    }
}
