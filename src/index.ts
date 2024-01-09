import 'dotenv/config';

import Logger from './modules/Logger';
import VoxifyTerminal from './terminal/VoxifyTerminal';
import ShardManager from './ShardManager';
import VoxifyClient from './client/VoxifyClient';
import Database from './database/Database';
import Cache from './caching/Cache';

const out = new Logger('VoxifyBot', '[Main] »');

process.argv.forEach((givenArgument: string) => {
    if (givenArgument.includes('=')) {
        const parts: string[] = givenArgument.split('=');
        if (parts.length < 2) return;
        const key: string = parts[0];
        const value: string = parts[1] || '';
        process.env[key] = value;
    }
});

if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
    out.setDebugging(9);
}

out.debug('Starting VoxifyBot');
if (process.env.NODE_ENV === 'production') {
    ShardManager.new(VoxifyTerminal.new())
        .spawn()
        .catch((error) => out.error(error));
} else {
    VoxifyTerminal.new();
    VoxifyClient.new(new Database(process.env.DATABASE_CONNECTION), new Cache()).start();
}

process.on('exit', () => out.info('Bye! Shutdown complete.'));
process.on('SIGINT', async () => {
    process.emit('beforeExit', 0);
    process.exit(0);
});
process.on('SIGTERM', async () => {
    process.emit('beforeExit', 0);
    process.exit(0);
});
