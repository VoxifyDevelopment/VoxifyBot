import Terminal from './VoxifyTerminal';

export interface Command {
    name: string;
    args: string[];
    terminal: Terminal;
}

export interface CommandExecutor {
    run: (command: Command) => Promise<boolean>;
}

export default CommandExecutor;
