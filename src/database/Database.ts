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
