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
