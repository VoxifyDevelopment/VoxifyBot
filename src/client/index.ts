import Cache from '../caching/Cache';
import Database from '../database/Database';
import VoxifyClient from './VoxifyClient';

const database = new Database(process.env.DATABASE_CONNECTION);
const cache = new Cache();
VoxifyClient.new(database, cache).start();
