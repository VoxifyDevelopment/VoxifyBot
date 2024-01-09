import CommandExecutor, { Command } from '../CommandExecutor';

export default class HelpCommand implements CommandExecutor {
    async run(command: Command) {
        const { terminal, name, args } = command;
        console.clear();
        terminal.getLogger().log('Cleared...');
        terminal.iface.prompt();
        return true;
    }
}
