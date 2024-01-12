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
    ActionRowBuilder,
    Locale,
    ModalBuilder,
    SlashCommandBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import SlashCommandExecutor, { SlashCommandEvent } from '../../executors/SlashCommandExecutor';
import VoxifyClient from '../../VoxifyClient';
import { channel } from 'diagnostics_channel';

export default class PingCommand implements SlashCommandExecutor {
    name = 'bug-report';

    data = (bot: VoxifyClient) => {
        let dataJson = new SlashCommandBuilder()
            .setName(this.name)
            .setDMPermission(false)
            .setDescription(bot.translations.translate('commands.bug-report.description'));

        let names = bot.translations.initializeLocales();
        let descriptions = bot.translations.initializeLocales();

        Object.entries(bot.translations.translations).forEach(([localeName, translation]) => {
            const normalizedLanguage = bot.translations.uppercaseSuffix(localeName);
            if (!Object.values(Locale).includes(normalizedLanguage as Locale)) return;

            let name = bot.translations.translateTo(normalizedLanguage, 'commands.bug-report.name');
            names[normalizedLanguage as Locale] = name;
            let description = bot.translations.translateTo(
                normalizedLanguage,
                'commands.bug-report.description'
            );
            descriptions[normalizedLanguage as Locale] = description;
        });

        dataJson.setNameLocalizations(names);
        dataJson.setDescriptionLocalizations(descriptions);

        return dataJson.toJSON();
    };

    async execute(event: SlashCommandEvent) {
        const { bot, interaction } = event;
        if (!interaction.guild || !interaction.member) return false;

        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        const key = bot.translations.translateTo(localeName, 'commands.bug-report.name');

        interaction
            .awaitModalSubmit({
                filter: (s) => s.customId === 'bug-report-' + interaction.member?.user.id || false,
                time: 1000 * 60 * 10 // 10 minites to fill out form
            })
            .then(async (modalInteraction) => {
                if (!modalInteraction.guild) return false;

                try {
                    let reportChannel =
                        bot.channels.cache.get(process.env.BUGS || '') ||
                        (await bot.channels.fetch(process.env.BUGS || '').catch(console.error));

                    if (!reportChannel) {
                        const errorContent = bot.translations.translateTo(
                            localeName,
                            'commands.bug-report.error'
                        );
                        const feedback = bot.translations.translateTo(localeName, 'feedback.error');
                        modalInteraction
                            .reply({
                                embeds: [
                                    await bot.tools.discord.generateEmbed(bot, {
                                        type: 'error',
                                        title: `${feedback} /${key}`,
                                        content: errorContent,
                                        guild: interaction.guild || undefined,
                                        user: interaction.user,
                                        timestamp: true
                                    })
                                ],
                                ephemeral: true
                            })
                            .catch(console.error);
                        return;
                    }

                    reportChannel = reportChannel as TextChannel;

                    const field = modalInteraction.fields.fields.find(
                        (f) => f.customId === 'bug-report-topic'
                    );
                    const topic: string = field?.value || 'No topic provided';
                    const field2 = modalInteraction.fields.fields.find(
                        (f) => f.customId === 'bug-report-description'
                    );
                    const description: string = field2?.value || 'No description provided';

                    const feedback = bot.translations.translateTo(localeName, 'feedback.success');
                    const content = bot.translations.translateTo(
                        localeName,
                        'commands.bug-report.success'
                    );

                    modalInteraction
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

                    reportChannel?.send({
                        embeds: [
                            {
                                title: `New BugReport (${interaction.user.id} | ${interaction.user.tag})`,
                                footer: {
                                    text: topic
                                },
                                description,
                                timestamp: new Date().toUTCString(),
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.displayAvatarURL()
                                },
                                color: 0xff0000
                            }
                        ]
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .catch(console.error);

        interaction
            .showModal(
                new ModalBuilder()
                    .setTitle(
                        bot.translations.translateTo(localeName, 'commands.bug-report.modal-title')
                    )
                    .setCustomId('bug-report-' + interaction.member?.user.id)
                    .addComponents(
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setMinLength(0)
                                .setMaxLength(512)
                                .setCustomId('bug-report-description----topic')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.attention'
                                    )
                                )
                                .setLabel(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.attention'
                                    )
                                ).setValue(`DO NO USE THIS!!! Please read.
${bot.translations.translateTo(localeName, 'commands.bug-report.description')}
${bot.translations.translateTo(localeName, 'commands.bug-report.description-2')}`)
                        ),
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setMinLength(6)
                                .setMaxLength(64)
                                .setCustomId('bug-report-topic')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.modal-topic'
                                    )
                                )
                                .setLabel(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.modal-top'
                                    )
                                )
                        ),
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setMinLength(60)
                                .setMaxLength(3969)
                                .setCustomId('bug-report-description')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.modal-description'
                                    )
                                )
                                .setLabel(
                                    bot.translations.translateTo(
                                        localeName,
                                        'commands.bug-report.modal-desc'
                                    )
                                )
                        )
                    )
            )
            .catch(console.error);

        return true;
    }
}
