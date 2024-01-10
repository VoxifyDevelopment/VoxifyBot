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

import * as readline from 'readline';
import * as fs from 'fs';
import Logger from '../modules/Logger';
import EventEmitter from 'events';
import CommandMap from './CommandMap';
import { Command } from './CommandExecutor';
import ShardManager from '../ShardManager';
import VoxifyClient from '../client/VoxifyClient';

export default class VoxifyTerminal extends EventEmitter {
    private initialized: boolean = false;
    private out: Logger;
    iface: readline.Interface;
    commandMap: CommandMap = new CommandMap();
    commands: string[] = [];
    private bot?: VoxifyClient;
    private shardManager?: ShardManager;

    constructor(shardManagerOrBot: ShardManager | VoxifyClient) {
        super();
        this.out = new Logger('VoxifyBot', '[Cli ] »');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }
        this.iface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ': '
        });

        if (shardManagerOrBot instanceof ShardManager) {
            this.shardManager = shardManagerOrBot;
        } else if (shardManagerOrBot instanceof VoxifyClient) {
            this.bot = shardManagerOrBot;
        }

        this.initialized = this.init();
    }

    static new(shardManagerOrBot: ShardManager | VoxifyClient) {
        return new VoxifyTerminal(shardManagerOrBot);
    }

    init(): boolean {
        this.iface.on('line', (input) => {
            this.handleCommand(input);
        });

        this.iface.on('close', () => {
            this.out.log('Closing Voxify Terminal.');
            process.emit('SIGTERM');
        });

        const commandFiles = fs.readdirSync(`${__dirname}/commands`);
        for (const file of commandFiles) {
            if (file.startsWith(`_`) || (!file.endsWith(`.ts`) && !file.endsWith(`.js`))) continue;
            const modulePath: string = `${__dirname}/commands/${file}`;
            import(modulePath)
                .then((props) => {
                    let inst = new props.default();
                    let { name } = inst;
                    if (!name) {
                        name = file.split('.')[0];
                    }

                    this.commandMap.set(name, inst);
                    inst.aliases.forEach((alias: string) => this.commandMap.set(alias, inst));
                    this.commands.push(name);
                    this.out.debug(
                        `Loaded cli.commands.${file}${
                            inst.aliases.length > 0 ? ' Aliases: ' + inst.aliases.join(', ') : ''
                        }`
                    );
                })
                .catch(console.error);
        }

        setTimeout(() => {
            this.out.log('Voxify Terminal initialized. Type "help" for a list of commands.');
            this.iface.prompt();
        }, 1000);

        return true;
    }

    get isInitialized() {
        return this.initialized;
    }

    handleCommand(input: string): void {
        let args = input.split(/ +/g);
        if (args.length < 1) {
            this.out.log('Invalid command. Type "help" for a list of commands.');
            this.iface.prompt();
            return;
        }

        let commandName = args.shift()?.toLowerCase();
        if (!commandName) {
            this.out.log('Invalid command. Type "help" for a list of commands.');
            this.iface.prompt();
            return;
        }

        let commandExecutor = this.commandMap.get(commandName);
        if (!commandExecutor) {
            this.out.log('Unknown command. Type "help" for a list of commands.');
            this.iface.prompt();
            return;
        }

        let command: Command = {
            args,
            name: commandName,
            terminal: this,
            shardManager: this.shardManager,
            bot: this.bot
        };

        try {
            commandExecutor.run(command).catch((err) => this.emit('error', err));
        } catch (err) {
            this.emit('error', err);
        }
    }

    stop(): void {
        this.iface.close();
    }

    getLogger(): Logger {
        return this.out;
    }
}
