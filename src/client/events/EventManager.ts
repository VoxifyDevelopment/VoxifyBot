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

import {
    ButtonInteraction,
    CommandInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    UserContextMenuCommandInteraction
} from 'discord.js';
import VoxifyClient from '../VoxifyClient';
import Executor from '../executors/Executor';
import VoiceStateUpdateEvent from './VoiceStateUpdateEvent';
import premiumCheckAndAdd from '../PremiumFeatures';

export default class EventManager {
    private bot: VoxifyClient;

    private button: _ButtonInteractionEventExecutor = new _ButtonInteractionEventExecutor();
    private modal: _ModalInteractionEventExecutor = new _ModalInteractionEventExecutor();
    private slash: _CommandInteractionEventExecutor = new _CommandInteractionEventExecutor();
    private userContext: _UserContextMenuInteractionEventExecutor =
        new _UserContextMenuInteractionEventExecutor();
    private messageContext: _MessageContextMenuInteractionEventExecutor =
        new _MessageContextMenuInteractionEventExecutor();

    constructor(bot: VoxifyClient) {
        this.bot = bot;

        this.bot.on('shardReady', async (shardId) => {
            this.bot.shardId = shardId;
            this.bot.cachePrefix = `${this.bot.user?.id}.${shardId}`;

            this.bot.tools.discord.updateStatus(bot).catch(console.error);
            this.bot.tools.general.randomInterval(60000, 240000, () =>
                this.bot.tools.discord.updateStatus(bot).catch(console.error)
            );

            this.bot.premiumEnabled =
                (await premiumCheckAndAdd(this.bot).catch(console.error)) || false;
            if (!this.bot.premiumEnabled)
                this.bot.out.debug('Sadly the premium features are disabled');

            this.bot.out.debug(`Shard: ${this.bot.shardId} Registering (/) commands.`);

            if (!this.bot.premiumEnabled) {
                this.bot.on('voiceStateUpdate', async (oldState, newState) => {
                    try {
                        VoiceStateUpdateEvent.execute(this.bot, oldState, newState).catch((err) =>
                            this.bot.out.logError(err)
                        );
                    } catch (err) {
                        this.bot.out.error(err);
                    }
                });
            }

            let commandData = [
                ...this.bot.slashCommandInteractions.map((c) => c.data(this.bot)),
                ...this.bot.userContextInteractions.map((c) => c.data(this.bot)),
                ...this.bot.messageContextInteractions.map((c) => c.data(this.bot))
            ];

            this.bot.application?.commands.set(commandData);

            this.bot.out.debug(
                `Shard: ${this.bot.shardId} Registered ${bot.slashCommandInteractions.size} (/) commands.`
            );

            this.bot.cache.redis
                .set(`${this.bot.cachePrefix}.lastRestarted`, Date.now())
                .catch(() => {});
            this.bot.out.info(`Shard ${shardId} is ready!`);
        });

        this.bot.on('shardDisconnect', async (event, shardId) => {
            this.bot.out.info(`Shard ${shardId} disconnected with code ${event.code}`);
        });

        this.bot.on('interactionCreate', async (interaction) => {
            try {
                // console.log(interaction);
                if (interaction.isButton()) {
                    this.button.execute({ bot: this.bot, interaction }).catch(console.error);
                } else if (interaction.isModalSubmit()) {
                    this.modal.execute({ bot: this.bot, interaction }).catch(console.error);
                } else if (interaction.isUserContextMenuCommand()) {
                    this.userContext.execute({ bot: this.bot, interaction }).catch(console.error);
                } else if (interaction.isMessageContextMenuCommand()) {
                    this.messageContext
                        .execute({ bot: this.bot, interaction })
                        .catch(console.error);
                } else if (interaction.isChatInputCommand()) {
                    this.slash.execute({ bot: this.bot, interaction }).catch(console.error);
                }
            } catch (error) {
                this.bot.out.error('Error processing interaction:', error);
            }
        });

        this.bot.on('guildCreate', async (guild) => {
            this.bot.out.debug(
                `Shard: ${this.bot.shardId} | GShard: ${guild.shardId} Created in: ${guild.id} [${guild.name}] | ${guild.preferredLocale}`
            );
        });

        this.bot.on('guildDelete', async (guild) => {
            this.bot.out.debug(
                `Shard: ${this.bot.shardId} | GShard: ${guild.shardId} Removed from: ${guild.id} [${guild.name}] | ${guild.preferredLocale}`
            );
        });
    }
}

export interface ButtonInteractionEvent {
    bot: VoxifyClient;
    interaction: ButtonInteraction;
}

export interface CommandInteractionEvent {
    bot: VoxifyClient;
    interaction: CommandInteraction;
}

export interface UserContextMenuInteractionEvent {
    bot: VoxifyClient;
    interaction: UserContextMenuCommandInteraction;
}

export interface MessageContextMenuInteractionEvent {
    bot: VoxifyClient;
    interaction: MessageContextMenuCommandInteraction;
}

export interface ModalInteractionEvent {
    bot: VoxifyClient;
    interaction: ModalSubmitInteraction;
}

export class _ButtonInteractionEventExecutor implements Executor<ButtonInteractionEvent> {
    async execute(event: ButtonInteractionEvent): Promise<boolean> {
        try {
            return (
                event.bot.buttonCommandInteractions
                    .get(event.interaction.customId)
                    ?.execute({ ...event }) || false
            );
        } catch (err) {
            return false;
        }
    }
}

export class _ModalInteractionEventExecutor implements Executor<ModalInteractionEvent> {
    async execute(event: ModalInteractionEvent): Promise<boolean> {
        try {
            return (
                event.bot.modalSubmitInteractions
                    .get(event.interaction.customId)
                    ?.execute({ ...event }) || false
            );
        } catch (err) {
            return false;
        }
    }
}

export class _CommandInteractionEventExecutor implements Executor<CommandInteractionEvent> {
    async execute(event: CommandInteractionEvent): Promise<boolean> {
        try {
            return (
                event.bot.slashCommandInteractions
                    .get(event.interaction.commandName)
                    ?.execute({ ...event }) || false
            );
        } catch (err) {
            return false;
        }
    }
}

export class _UserContextMenuInteractionEventExecutor
    implements Executor<UserContextMenuInteractionEvent>
{
    async execute(event: UserContextMenuInteractionEvent): Promise<boolean> {
        try {
            return (
                event.bot.userContextInteractions
                    .get(event.interaction.commandName)
                    ?.execute({ ...event }) || false
            );
        } catch (err) {
            return false;
        }
    }
}

export class _MessageContextMenuInteractionEventExecutor
    implements Executor<MessageContextMenuInteractionEvent>
{
    async execute(event: MessageContextMenuInteractionEvent): Promise<boolean> {
        try {
            return (
                event.bot.messageContextInteractions
                    .get(event.interaction.commandName)
                    ?.execute({ ...event }) || false
            );
        } catch (err) {
            return false;
        }
    }
}
