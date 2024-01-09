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
