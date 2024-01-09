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
import Logger from '../modules/Logger';
import EventEmitter from 'events';
import CommandMap from './CommandMap';
import { Command } from './CommandExecutor';
import HelpCommand from './commands/HelpCommand';
import ClearCommand from './commands/ClearCommand';

export default class VoxifyTerminal extends EventEmitter {
    private initialized: boolean = false;
    private out: Logger;
    iface: readline.Interface;
    commandMap: CommandMap = new CommandMap();

    constructor() {
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
        this.initialized = this.init();
    }

    static new() {
        return new VoxifyTerminal();
    }

    init(): boolean {
        this.iface.on('line', (input) => {
            this.handleCommand(input);
        });

        this.iface.on('close', () => {
            this.out.log('Closing Voxify Terminal.');
            process.emit('SIGTERM');
        });

        const helpCommand = new HelpCommand();
        this.commandMap.set('help', helpCommand);
        this.commandMap.set('?', helpCommand);

        const clearCommand = new ClearCommand();
        this.commandMap.set('clear', clearCommand);
        this.commandMap.set('cl', clearCommand);
        this.commandMap.set('c', clearCommand);

        setTimeout(() => {
            this.out.log('Voxify Terminal initialized. Type "help" for a list of commands.');
            this.iface.prompt();
        }, 5000);

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

        let command: Command = { args, name: commandName, terminal: this };

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
