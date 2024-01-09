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

import { Locale, SlashCommandBuilder } from 'discord.js';
import SlashCommandExecutor, { SlashCommandEvent } from '../../executors/SlashCommandExecutor';
import VoxifyClient from '../../VoxifyClient';

export default class PingCommand implements SlashCommandExecutor {
    name = 'languages';

    data = (bot: VoxifyClient) => {
        let dataJson = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(bot.translations.translate('commands.languages.description'));

        let names = bot.translations.initializeLocales();
        let descriptions = bot.translations.initializeLocales();

        Object.entries(bot.translations.translations).forEach(([localeName, translation]) => {
            const normalizedLanguage = bot.translations.uppercaseSuffix(localeName);
            if (!Object.values(Locale).includes(normalizedLanguage as Locale)) return;

            let name = bot.translations.translateTo(normalizedLanguage, 'commands.languages.name');
            names[normalizedLanguage as Locale] = name;
            let description = bot.translations.translateTo(
                normalizedLanguage,
                'commands.languages.description'
            );
            descriptions[normalizedLanguage as Locale] = description;
        });

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        return dataJson.toJSON();
    };

    async execute(event: SlashCommandEvent) {
        const { bot, interaction } = event;
        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        let languages: string[] = [];
        for (let lang of Object.keys(bot.translations.translations)) {
            const namedLanguage = bot.translations.translateTo(lang, 'lang.named');
            languages.push(namedLanguage);
        }
        languages.sort((a, b) => a.localeCompare(b, localeName));

        const key = bot.translations.translateTo(localeName, 'commands.languages.name');
        const feedback = bot.translations.translateTo(localeName, 'feedback.success');
        const content = bot.translations.translateTo(localeName, 'commands.languages.success', {
            languages: languages.join(', ')
        });

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
