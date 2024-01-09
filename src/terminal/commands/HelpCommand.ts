import CommandExecutor, { Command } from '../CommandExecutor';

export default class HelpCommand implements CommandExecutor {
    async run(command: Command) {
        const { terminal, name, args } = command;
        terminal.getLogger().log('Not implemented yet.');
        return true;
    }
}
