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

import { Client, Collection, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

import * as discord from './tools/discord';
import * as general from './tools/general';
import Logger from '../modules/Logger';
import Cache from '../caching/Cache';
import TranslationHandler from './message-format/TranslationHandler';
import path from 'path';
import * as fs from 'fs';
import EventManager from './events/EventManager';

import ButtonCommandExecutor from './executors/ButtonCommandExecutor';
import ModalCommandExecutor from './executors/ModalCommandExecutor';
import SlashCommandExecutor from './executors/SlashCommandExecutor';
import UserContextMenuExecutor from './executors/UserContextMenuExecutor';

export default class VoxifyClient extends Client {
    initialized: boolean = false;
    out: Logger;
    cache: Cache;
    translations: TranslationHandler;
    shardId: number = 0;
    cachePrefix: string = '';

    tools = { discord, general };

    eventManager: EventManager;

    slashCommandInteractions: Collection<string, SlashCommandExecutor> = new Collection();
    modalSubmitInteractions: Collection<string, ModalCommandExecutor> = new Collection();
    buttonCommandInteractions: Collection<string, ButtonCommandExecutor> = new Collection();
    autocompleteInteractions: Collection<string, any> = new Collection();
    userContextInteractions: Collection<string, UserContextMenuExecutor> = new Collection();
    messageContextInteractions: Collection<string, any> = new Collection();

    constructor(cache: Cache, shardId?: number) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
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

        this.cache = cache;

        this.eventManager = new EventManager(this);

        this.initialized = this.init();
        process.on('beforeExit', async () => {
            this.stop();
        });
    }

    static new(cache: Cache) {
        return new VoxifyClient(cache);
    }

    init(): boolean {
        this.out.debug('Initializing Bot...');

        const modalFiles = fs.readdirSync(`${__dirname}/interactions/modalSubmits`);
        for (const file of modalFiles) {
            if (file.startsWith(`_`) || (!file.endsWith(`.ts`) && !file.endsWith(`.js`))) continue;
            const modulePath: string = `${__dirname}/interactions/modalSubmits/${file}`;
            import(modulePath)
                .then((props) => {
                    let inst = new props.default();
                    let { name } = inst;
                    if (!name) {
                        name = file.split('.')[0];
                    }

                    this.modalSubmitInteractions.set(name, inst);
                    this.out.debug(`Loaded modals.${file}`);
                })
                .catch(console.error);
        }

        const buttonFiles = fs.readdirSync(`${__dirname}/interactions/buttonCommands`);
        for (const file of buttonFiles) {
            if (file.startsWith(`_`) || (!file.endsWith(`.ts`) && !file.endsWith(`.js`))) continue;
            const modulePath: string = `${__dirname}/interactions/buttonCommands/${file}`;
            import(modulePath)
                .then((props) => {
                    let inst = new props.default();
                    let { name } = inst;
                    if (!name) {
                        name = file.split('.')[0];
                    }

                    this.buttonCommandInteractions.set(name, inst);
                    this.out.debug(`Loaded buttons.${file}`);
                })
                .catch(console.error);
        }

        const slashCommandFiles = fs.readdirSync(`${__dirname}/interactions/slashCommands`);
        for (const file of slashCommandFiles) {
            if (file.startsWith(`_`) || (!file.endsWith(`.ts`) && !file.endsWith(`.js`))) continue;
            const modulePath: string = `${__dirname}/interactions/slashCommands/${file}`;
            import(modulePath)
                .then((props) => {
                    let inst = new props.default();
                    let { name } = inst;
                    if (!name) {
                        name = file.split('.')[0];
                    }

                    this.slashCommandInteractions.set(name, inst);
                    this.out.debug(`Loaded slash.${file}`);
                })
                .catch(console.error);
        }

        const userContextFiles = fs.readdirSync(`${__dirname}/interactions/userContext`);
        for (const file of userContextFiles) {
            if (file.startsWith(`_`) || (!file.endsWith(`.ts`) && !file.endsWith(`.js`))) continue;
            const modulePath: string = `${__dirname}/interactions/userContext/${file}`;
            import(modulePath)
                .then((props) => {
                    let inst = new props.default();
                    let { name } = inst;
                    if (!name) {
                        name = file.split('.')[0];
                    }

                    if (inst.id && typeof inst.id == 'function') name = inst.id(this);
                    else if (inst.id && typeof inst.id == 'string') name = inst.id;

                    this.userContextInteractions.set(name, inst);
                    this.out.debug(`Loaded context.user.${file}`);
                })
                .catch(console.error);
        }

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
