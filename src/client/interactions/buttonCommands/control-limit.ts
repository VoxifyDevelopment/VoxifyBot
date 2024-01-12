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
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import ButtonCommandExecutor, { ButtonCommandEvent } from '../../executors/ButtonCommandExecutor';

export default class btn implements ButtonCommandExecutor {
    async execute(event: ButtonCommandEvent) {
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

        if (
            !(await bot.tools.discord.checkTvcArgs(
                localeName,
                resolvedArgs,
                bot.translations.translateTo(localeName, 'buttons.close.name'),
                bot,
                interaction,
                true,
                true,
                PermissionFlagsBits.ManageChannels
            ))
        )
            return false;

        const { member, channel } = resolvedArgs;

        interaction
            .awaitModalSubmit({
                filter: (interaction) => interaction.customId === 'modal-limit-' + member.id,
                time: 60000
            })
            .then(async (modalInteraction) => {
                if (!modalInteraction.guild) return false;
                const field = modalInteraction.fields.fields.find(
                    (f) => f.customId === 'new-limit'
                );
                const newLimit: number = parseInt(field?.value || '100') || 100;

                if (newLimit < 0 || newLimit > 99) {
                    const key = bot.translations.translateTo(localeName, 'buttons.limit.name');
                    const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
                    const content = bot.translations.translateTo(
                        localeName,
                        'buttons.limit.wrong-input',
                        {
                            limit: `${newLimit}`
                        }
                    );

                    modalInteraction
                        .reply({
                            embeds: [
                                await bot.tools.discord.generateEmbed(bot, {
                                    type: 'warning',
                                    title: `${feedback} ${key}`,
                                    content,
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

                if (newLimit === channel?.userLimit) {
                    const key = bot.translations.translateTo(localeName, 'buttons.limit.name');
                    const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
                    const content = bot.translations.translateTo(
                        localeName,
                        'buttons.limit.already',
                        {
                            limit: `${newLimit}`
                        }
                    );

                    modalInteraction
                        .reply({
                            embeds: [
                                await bot.tools.discord.generateEmbed(bot, {
                                    type: 'warning',
                                    title: `${feedback} ${key}`,
                                    content,
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

                channel
                    ?.setUserLimit(
                        newLimit,
                        `TempVoice | limit change requested [by ${member.user.username}] [from ${channel.userLimit}] [to ${newLimit}]`
                    )
                    .catch(console.error);

                const key = bot.translations.translateTo(localeName, 'buttons.limit.name');
                const feedback = bot.translations.translateTo(localeName, 'feedback.success');
                const content = bot.translations.translateTo(localeName, 'buttons.limit.success', {
                    limit: `${newLimit}`
                });

                modalInteraction
                    .reply({
                        embeds: [
                            await bot.tools.discord.generateEmbed(bot, {
                                type: 'success',
                                title: `${feedback} ${key}`,
                                content,
                                guild: interaction.guild || undefined,
                                user: interaction.user,
                                timestamp: true
                            })
                        ],
                        ephemeral: true
                    })
                    .catch(console.error);
            })
            .catch(console.error);

        interaction
            .showModal(
                new ModalBuilder()
                    .setTitle(bot.translations.translateTo(localeName, 'buttons.limit.name'))
                    .setCustomId('modal-limit-' + member.id)
                    .addComponents(
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setMinLength(1)
                                .setMaxLength(2)
                                .setCustomId('new-limit')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(
                                    bot.translations.translateTo(
                                        localeName,
                                        'buttons.limit.modal.placeholder'
                                    )
                                )
                                .setLabel(
                                    bot.translations.translateTo(
                                        localeName,
                                        'buttons.limit.modal.label'
                                    )
                                )
                                .setValue('' + channel?.userLimit || '')
                        )
                    )
            )
            .catch(console.error);

        return true;
    }
}
