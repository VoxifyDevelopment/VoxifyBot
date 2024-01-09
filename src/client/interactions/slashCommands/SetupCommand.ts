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

import { ChannelType, Locale, SlashCommandBuilder } from 'discord.js';
import SlashCommandExecutor, { SlashCommandEvent } from '../../executors/SlashCommandExecutor';
import VoxifyClient from '../../VoxifyClient';

export default class PingCommand implements SlashCommandExecutor {
    name = 'setup';

    data = (bot: VoxifyClient) => {
        let dataJson = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(bot.translations.translate('commands.setup.description'));

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
            let description = bot.translations.translateTo(
                normalizedLanguage,
                'commands.setup.description'
            );
            descriptions[normalizedLanguage as Locale] = description;

            let optionContainerName = bot.translations.translateTo(
                normalizedLanguage,
                'commands.setup.options.container.name'
            );
            optionContainerNames[normalizedLanguage as Locale] = optionContainerName;
            let optionContainerDescription = bot.translations.translateTo(
                normalizedLanguage,
                'commands.setup.options.container.description'
            );
            optionContainerDescriptions[normalizedLanguage as Locale] = optionContainerDescription;

            let optionLobbyName = bot.translations.translateTo(
                normalizedLanguage,
                'commands.setup.options.lobby.name'
            );
            optionLobbyNames[normalizedLanguage as Locale] = optionLobbyName;
            let optionLobbyDescription = bot.translations.translateTo(
                normalizedLanguage,
                'commands.setup.options.lobby.description'
            );
            optionLobbyDescriptions[normalizedLanguage as Locale] = optionLobbyDescription;
        });

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.addChannelOption((channelOption) => {
            channelOption.setRequired(true);
            channelOption.addChannelTypes(ChannelType.GuildCategory);

            channelOption.setName(
                bot.translations.translate('commands.setup.options.container.name')
            );
            channelOption.setDescription(
                bot.translations.translate('commands.setup.options.container.name')
            );

            channelOption.setNameLocalizations(optionContainerNames);
            channelOption.setDescriptionLocalizations(optionContainerDescriptions);
            return channelOption;
        });

        dataJson.addChannelOption((channelOption) => {
            channelOption.setRequired(true);
            channelOption.addChannelTypes(ChannelType.GuildVoice);

            channelOption.setName(bot.translations.translate('commands.setup.options.lobby.name'));
            channelOption.setDescription(
                bot.translations.translate('commands.setup.options.lobby.name')
            );

            channelOption.setNameLocalizations(optionLobbyNames);
            channelOption.setDescriptionLocalizations(optionLobbyDescriptions);
            return channelOption;
        });

        return dataJson.toJSON();
    };

    async execute(event: SlashCommandEvent) {
        const { bot, interaction } = event;
        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        interaction.reply('Not implemented yet.');

        return true;
    }
}
