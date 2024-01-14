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

import { ChannelType, CommandInteractionOptionResolver, Locale, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import SlashCommandExecutor, { SlashCommandEvent } from '../../executors/SlashCommandExecutor';
import VoxifyClient from '../../VoxifyClient';

export default class PingCommand implements SlashCommandExecutor {
    name = 'setup';

    data = (bot: VoxifyClient) => {
        let dataJson = new SlashCommandBuilder().setName(this.name).setDescription(bot.translations.translate('commands.setup.description'));

        let names = bot.translations.initializeLocales();
        let descriptions = bot.translations.initializeLocales();

        let optionContainerNames = bot.translations.initializeLocales();
        let optionContainerDescriptions = bot.translations.initializeLocales();

        let optionLobbyNames = bot.translations.initializeLocales();
        let optionLobbyDescriptions = bot.translations.initializeLocales();

        Object.entries(bot.translations.translations).forEach(([localeName, translation]) => {
            const normalizedLanguage = bot.translations.uppercaseSuffix(localeName);
            if (!Object.values(Locale).includes(normalizedLanguage as Locale)) return;

            let name = bot.translations.translateTo(normalizedLanguage, 'commands.setup.name');
            names[normalizedLanguage as Locale] = name;
            let description = bot.translations.translateTo(normalizedLanguage, 'commands.setup.description');
            descriptions[normalizedLanguage as Locale] = description;

            let optionContainerName = bot.translations.translateTo(normalizedLanguage, 'commands.setup.options.container.name');
            optionContainerNames[normalizedLanguage as Locale] = optionContainerName;
            let optionContainerDescription = bot.translations.translateTo(normalizedLanguage, 'commands.setup.options.container.description');
            optionContainerDescriptions[normalizedLanguage as Locale] = optionContainerDescription;

            let optionLobbyName = bot.translations.translateTo(normalizedLanguage, 'commands.setup.options.lobby.name');
            optionLobbyNames[normalizedLanguage as Locale] = optionLobbyName;
            let optionLobbyDescription = bot.translations.translateTo(normalizedLanguage, 'commands.setup.options.lobby.description');
            optionLobbyDescriptions[normalizedLanguage as Locale] = optionLobbyDescription;
        });

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.addChannelOption((channelOption) => {
            channelOption.setRequired(true);
            channelOption.addChannelTypes(ChannelType.GuildCategory);

            channelOption.setName(bot.translations.translate('commands.setup.options.container.name'));
            channelOption.setDescription(bot.translations.translate('commands.setup.options.container.name'));

            channelOption.setNameLocalizations(optionContainerNames);
            channelOption.setDescriptionLocalizations(optionContainerDescriptions);
            return channelOption;
        });

        dataJson.addChannelOption((channelOption) => {
            channelOption.setRequired(true);
            channelOption.addChannelTypes(ChannelType.GuildVoice);

            channelOption.setName(bot.translations.translate('commands.setup.options.lobby.name'));
            channelOption.setDescription(bot.translations.translate('c.options.lobby.name'));

            channelOption.setNameLocalizations(optionLobbyNames);
            channelOption.setDescriptionLocalizations(optionLobbyDescriptions);
            return channelOption;
        });

        dataJson.setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

        return dataJson.toJSON();
    };

    async execute(event: SlashCommandEvent) {
        const { bot, interaction } = event;
        const guild = interaction.guild;
        if (!guild) return false;
        const member = interaction.member;
        if (!member) return false;

        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        if (!guild.members.cache.get(bot.user?.id || '')?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const key = bot.translations.translateTo(localeName, 'commands.setup.name');
            const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
            const content = bot.translations.translateTo(localeName, 'commands.setup.result.error', {
                error: bot.translations.translateTo(localeName, 'commands.setup.errors.no-perm')
            });
            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'warning',
                            title: `${feedback} /${key}`,
                            content,
                            guild: interaction.guild || undefined,
                            user: interaction.user,
                            timestamp: true
                        })
                    ],
                    ephemeral: true
                })
                .catch(console.error);

            return false;
        }

        let stop = false;
        setTimeout(async () => {
            if (stop) return;
            stop = true;

            const key = bot.translations.translateTo(localeName, 'commands.setup.name');
            const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
            const content = bot.translations.translateTo(localeName, 'commands.setup.result.error', {
                error: '```\nDatabase performance currently too slow...\n```'
            });
            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'error',
                            title: `${feedback} /${key}`,
                            content,
                            guild: interaction.guild || undefined,
                            user: interaction.user,
                            timestamp: true
                        })
                    ],
                    ephemeral: true
                })
                .catch(console.error);
        }, 800);

        let options = interaction.options as CommandInteractionOptionResolver;
        let requestedContainer = options.getChannel('container');
        let requestedLobby = options.getChannel('lobby');

        if (!requestedContainer || !requestedLobby) {
            const key = bot.translations.translateTo(localeName, 'commands.setup.name');
            const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
            const content = bot.translations.translateTo(localeName, 'commands.setup.result.error', {
                error: !requestedContainer
                    ? bot.translations.translateTo(localeName, 'commands.setup.errors.no-access-container')
                    : bot.translations.translateTo(localeName, 'commands.setup.errors.no-access-lobby')
            });
            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'warning',
                            title: `${feedback} /${key}`,
                            content,
                            guild: interaction.guild || undefined,
                            user: interaction.user,
                            timestamp: true
                        })
                    ],
                    ephemeral: true
                })
                .catch(console.error);

            return false;
        }

        let containerCached = await bot.cache.redis.get(`containerCached.${guild.id}`);
        let lobbyCached = await bot.cache.redis.get(`lobbyCached.${guild.id}`);

        if (containerCached != requestedContainer.id) {
            await bot.cache.redis.set(`containerCached.${guild.id}`, requestedContainer.id);
        }

        if (lobbyCached != requestedLobby.id) {
            await bot.cache.redis.set(`lobbyCached.${guild.id}`, requestedLobby.id);
        }

        if (stop) return false;
        stop = true;

        const key = bot.translations.translateTo(localeName, 'commands.setup.name');
        const feedback = bot.translations.translateTo(localeName, 'feedback.success');
        let content = bot.translations.translateTo(localeName, 'commands.setup.result.success', {
            channel: ` <#${requestedLobby.id}>`,
            container: ` <#${requestedContainer.id}>`
        });

        if (process.env.NODE_ENV && process.env.NODE_ENV != 'production') {
            content += `

\`\`\`
lobbyCached.${guild.id}     | ${requestedLobby.id} | ${requestedLobby.name}
containerCached.${guild.id} | ${requestedContainer.id} | ${requestedContainer.name}
\`\`\``;
        }

        interaction
            .reply({
                embeds: [
                    await bot.tools.discord.generateEmbed(bot, {
                        type: 'success',
                        title: `${feedback} /${key}`,
                        content,
                        guild: interaction.guild || undefined,
                        user: interaction.user,
                        timestamp: true
                    })
                ],
                ephemeral: true
            })
            .catch(console.error);

        return true;
    }
}
