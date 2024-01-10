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
    help?: string[] = [
        'list - shows a list of available shards.',
        'restart <shardId> - restarts a given shard by its id.'
    ];

    async run(command: Command) {
        const { terminal, name, args, bot, shardManager } = command;
        if (shardManager) {
            let subCommand = args.shift();

            switch (subCommand?.toLowerCase()) {
                case 'list':
                    terminal
                        .getLogger()
                        .log(
                            '&e----------------------------------- SHARDS -----------------------------------&r'
                        );
                    shardManager.shards.forEach((shard) => {
                        terminal
                            .getLogger()
                            .info(
                                `- » ${shard.id} | ${
                                    shard.process
                                        ? `ProcessID: ${shard.process.pid}`
                                        : `WorkerID: ${shard.worker?.threadId}`
                                }`
                            );
                    });
                    terminal
                        .getLogger()
                        .log(
                            '&e----------------------------------- SHARDS -----------------------------------&r'
                        );
                    return true;
                case 'restart':
                    let shardId = args.shift();
                    if (!shardId) break;

                    if (!shardManager.shards.at(parseInt(shardId))) {
                        terminal.getLogger().warning('That shard does not exist.');
                        return true;
                    }
                    shardManager.shards.at(parseInt(shardId))?.respawn();
                    terminal.getLogger().warning(`Restarting shard ${shardId}.`);
                    return true;
                default:
                    break;
            }

            terminal.getLogger().log(`Command invalid. Usage:`);
            this.help?.forEach((h) => {
                terminal.getLogger().log(`&7&a» ${this.name}&7${h}`);
            });

            return true;
        }
        terminal
            .getLogger()
            .log(`Sharding not enabled... Running ${bot?.user?.username} ID: ${bot?.user?.id}`);
        return true;
    }
}
