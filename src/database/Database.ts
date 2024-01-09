import { Mongoose, ConnectOptions } from 'mongoose';
import Logger from '../modules/Logger';

export default class Database extends Mongoose {
    private out: Logger;

    constructor(databaseConnection?: string, database?: string) {
        super();
        this.out = new Logger('VoxifyBot', '[Bot ] »');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }

        let connectOptions: ConnectOptions = {};
        if (database) {
            connectOptions.dbName = database;
        }

        this.connect(
            databaseConnection || process.env.MONGODB_URL || 'mongodb://localhost:27017/voxify_bot',
            connectOptions
        ).catch((error) => this.connection.emit('error', error));

        this.connection.on('connected', () =>
            this.out.debugExtensive('Database connection established...')
        );
        this.connection.on('disconnect', () =>
            this.out.debugExtensive('Database connection aborted...')
        );

        this.connection.on('error', (err) => this.out.error('Database connection error:\n', err));

        process.on('beforeExit', async () => {
            this.disconnect();
        });
    }
}
