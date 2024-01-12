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
                filter: (interaction) => interaction.customId === 'modal-rename-' + member.id,
                time: 60000
            })
            .then(async (modalInteraction) => {
                if (!modalInteraction.guild) return false;
                const field = modalInteraction.fields.fields.find(
                    (f) => f.customId === 'new-rename'
                );
                const newName: string = field?.value || member.id;

                if (newName === channel?.name) {
                    const key = bot.translations.translateTo(localeName, 'buttons.rename.name');
                    const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
                    const content = bot.translations.translateTo(
                        localeName,
                        'buttons.rename.already',
                        {
                            name: newName
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
                    ?.setName(
                        newName,
                        `TempVoice | bitrate change requested [by ${member.user.username}] [from ${channel.name}] [to ${newName}]`
                    )
                    .catch(console.error);

                const key = bot.translations.translateTo(localeName, 'buttons.rename.name');
                const feedback = bot.translations.translateTo(localeName, 'feedback.warning');
                const content = bot.translations.translateTo(localeName, 'buttons.rename.success', {
                    name: newName
                });

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
            })
            .catch(console.error);

        interaction
            .showModal(
                new ModalBuilder()
                    .setTitle(bot.translations.translateTo(localeName, 'buttons.rename.name'))
                    .setCustomId('modal-rename-' + member.id)
                    .addComponents(
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setMinLength(3)
                                .setMaxLength(32)
                                .setCustomId('new-rename')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder(
                                    bot.translations.translateTo(
                                        localeName,
                                        'buttons.rename.modal.placeholder'
                                    )
                                )
                                .setLabel(
                                    bot.translations.translateTo(
                                        localeName,
                                        'buttons.rename.modal.input'
                                    )
                                )
                                .setValue(channel?.name || '')
                        )
                    )
            )
            .catch(console.error);

        return true;
    }
}
