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
    CommandInteractionOptionResolver,
    Locale,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js';
import SlashCommandExecutor, { SlashCommandEvent } from '../../executors/SlashCommandExecutor';
import VoxifyClient from '../../VoxifyClient';

export default class PingCommand implements SlashCommandExecutor {
    name = 'controls';

    data = (bot: VoxifyClient) => {
        let dataJson = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(bot.translations.translate('commands.controls.description'));

        let names = bot.translations.initializeLocales();
        let descriptions = bot.translations.initializeLocales();

        let namesShow = bot.translations.initializeLocales();
        let descriptionsShow = bot.translations.initializeLocales();

        Object.entries(bot.translations.translations).forEach(([localeName, translation]) => {
            const normalizedLanguage = bot.translations.uppercaseSuffix(localeName);
            if (!Object.values(Locale).includes(normalizedLanguage as Locale)) return;

            let name = bot.translations.translateTo(normalizedLanguage, 'commands.controls.name');
            names[normalizedLanguage as Locale] = name;
            let description = bot.translations.translateTo(
                normalizedLanguage,
                'commands.controls.show.description'
            );
            descriptions[normalizedLanguage as Locale] = description;

            let nameShow = bot.translations.translateTo(
                normalizedLanguage,
                'commands.controls.show.name'
            );
            namesShow[normalizedLanguage as Locale] = nameShow;
            let descriptionShow = bot.translations.translateTo(
                normalizedLanguage,
                'commands.controls.show.description'
            );
            descriptionsShow[normalizedLanguage as Locale] = descriptionShow;
        });

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.addBooleanOption((channelOption) => {
            channelOption.setRequired(false);

            channelOption.setName(bot.translations.translate('commands.controls.show.name'));
            channelOption.setDescription(
                bot.translations.translate('commands.controls.show.description')
            );

            channelOption.setNameLocalizations(namesShow);
            channelOption.setDescriptionLocalizations(descriptionsShow);
            return channelOption;
        });

        return dataJson.toJSON();
    };

    async execute(event: SlashCommandEvent) {
        const { bot, interaction } = event;
        if (!interaction.guild) return false;

        let guildLocaleName = interaction.guild?.preferredLocale.toLowerCase() || 'en-us';
        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : guildLocaleName;

        const resolvedArgs = await bot.tools.discord
            .resolveTempVoiceArgs(bot, interaction)
            .catch(console.error);
        if (!resolvedArgs || resolvedArgs === true) {
            bot.out.debug('OUT: resolvedArgs not existent');
            return false;
        }

        let options = interaction.options as CommandInteractionOptionResolver;
        let show = options.getBoolean(bot.translations.translate('commands.controls.show.name'));
        if (!show) show = false;

        if (
            show &&
            !(await bot.tools.discord.checkTvcArgs(
                localeName,
                resolvedArgs,
                bot.translations.translateTo(localeName, 'commands.controls.name'),
                bot,
                interaction,
                false,
                show,
                PermissionFlagsBits.SendMessages
            ))
        ) {
            return false;
        } else if (
            !(await bot.tools.discord.checkTvcArgs(
                localeName,
                resolvedArgs,
                bot.translations.translateTo(localeName, 'commands.controls.name'),
                bot,
                interaction,
                false,
                show
            ))
        )
            return false;

        const { member, channel } = resolvedArgs;

        bot.tools.discord.generateTempVoiceControls(
            bot,
            interaction,
            localeName,
            guildLocaleName,
            show && channel != null,
            member.permissions.has(PermissionFlagsBits.ManageChannels) && show
                ? interaction.channel
                : channel
        );
        return true;
    }
}
