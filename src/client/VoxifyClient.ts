import { Client, Collection, SlashCommandBuilder } from 'discord.js';

import * as discord from './tools/discord';
import * as general from './tools/general';
import Logger from '../modules/Logger';
import Cache from '../caching/Cache';
import Database from '../database/Database';
import TranslationHandler from './message-format/TranslationHandler';
import path from 'path';

export default class VoxifyClient extends Client {
    initialized: boolean = false;
    out: Logger;
    db: Database;
    cache: Cache;
    translations: TranslationHandler;

    tools = { discord, general };

    slashCommandInteractions: Collection<string, any> = new Collection();
    modalSubmitInteractions: Collection<string, any> = new Collection();
    buttonCommandInteractions: Collection<string, any> = new Collection();
    autocompleteInteractions: Collection<string, any> = new Collection();
    userContextInteractions: Collection<string, any> = new Collection();
    messageContextInteractions: Collection<string, any> = new Collection();

    constructor(database: Database, cache: Cache, shardId?: number) {
        super({
            intents: [],
            partials: []
        });
        this.out = new Logger('VoxifyBot', shardId !== undefined ? `[Shard: ${shardId || 0}]` : '');
        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            this.out.setDebugging(9);
        }

        this.translations = new TranslationHandler({
            applicationName: 'VoxifyBot'
        });
        this.translations.loadTranslationsFromFolder(path.resolve(__dirname, '../i18n/'));

        Object.keys(this.translations.translations).forEach((langName) => {
            let trans = this.translations.translations[langName];
            this.out.debug(
                `Language loaded: ${this.translations.translateTo(
                    langName,
                    'lang.key'
                )} | ${this.translations.translateTo(
                    langName,
                    'lang.name'
                )} | ${this.translations.translateTo(langName, 'lang.named')}`
            );
        });

        this.db = database;
        this.cache = cache;

        this.initialized = this.init();
        process.on('beforeExit', async () => {
            this.stop();
        });
    }

    static new(database: Database, cache: Cache) {
        return new VoxifyClient(database, cache);
    }

    init(): boolean {
        this.out.debug('Initializing Bot...');

        return true;
    }

    async start(): Promise<boolean> {
        this.out.debug('Staring Bot...');

        if (!process.env.DISCORD_TOKEN) {
            throw new Error('Missing environment variables DISCORD_TOKEN');
        }

        this.login(process.env.DISCORD_TOKEN);

        return true;
    }

    async restart(): Promise<boolean> {
        this.stop()
            .then(this.start)
            .catch((err) => this.emit('error', err));
        return true;
    }

    async stop(): Promise<boolean> {
        this.destroy();
        this.out.debug('Client destroyed...');
        return true;
    }
}
