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
    ChannelFlags,
    GuildMember,
    PermissionFlagsBits,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction
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
                bot.translations.translateTo(localeName, 'buttons.kick.name'),
                bot,
                interaction,
                true,
                true,
                PermissionFlagsBits.MoveMembers
            ))
        )
            return false;

        const { member, channel } = resolvedArgs;

        interaction.channel
            ?.awaitMessageComponent({
                filter: (collected) =>
                    collected.isUserSelectMenu() &&
                    collected.customId === 'select-kick-' + member.id,
                time: 60000
            })
            .then(async (selectInteraction) => {
                selectInteraction = selectInteraction as UserSelectMenuInteraction;
                const toBan = selectInteraction.members;
                let usersBanned = [];
                let usersNotBanned = [];

                for (let [id, managedMember] of toBan) {
                    if (!(managedMember instanceof GuildMember)) {
                        let mem =
                            channel?.guild.members.cache.get(id) ||
                            (await channel?.guild.members.fetch(id).catch(console.error));
                        if (!mem || typeof mem === 'function') {
                            usersNotBanned.push(id);
                            continue;
                        }
                        managedMember = mem;
                    }

                    if (!channel) continue;

                    if (
                        managedMember.permissions.has(PermissionFlagsBits.Administrator) ||
                        managedMember.permissions.has(PermissionFlagsBits.ManageGuild) ||
                        managedMember.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)
                    ) {
                        usersNotBanned.push(managedMember.user.tag);
                        continue;
                    }

                    if (channel.members.has(managedMember.id)) {
                        managedMember.voice.disconnect(
                            `TempVoice | kick requested by [user ${member.user.username}]`
                        );
                    }
                    usersBanned.push(managedMember.user.tag);
                }

                const feedback = bot.translations.translateTo(localeName, 'feedback.success');
                const localizedName = bot.translations.translateTo(
                    localeName,
                    'context.user.kick-user.name'
                );

                selectInteraction
                    .reply({
                        embeds: [
                            await bot.tools.discord.generateEmbed(bot, {
                                type: 'success',
                                title: `${feedback} ${localizedName}`,
                                content: `
${usersBanned.length > 0 ? `✔️ ${usersBanned.join(',\n✔️')}` : ''}
${usersNotBanned.length > 0 ? `❌ ${usersNotBanned.join(',\n❌')}` : ''}
                                `,
                                guild: interaction.guild || undefined,
                                user: interaction.user,
                                timestamp: true
                            })
                        ],
                        ephemeral: true
                    })
                    .catch(console.error);
            });

        const feedback = bot.translations.translateTo(localeName, 'feedback.success');
        const localizedName = bot.translations.translateTo(
            localeName,
            'context.user.kick-user.name'
        );

        interaction
            .reply({
                embeds: [
                    await bot.tools.discord.generateEmbed(bot, {
                        type: 'success',
                        content: `${feedback} ${localizedName}`,
                        guild: interaction.guild || undefined,
                        user: interaction.user,
                        timestamp: true
                    })
                ],
                ephemeral: true,
                components: [
                    new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                        new UserSelectMenuBuilder()
                            .setMinValues(1)
                            .setMaxValues(3)
                            .setCustomId('select-kick-' + member.id)
                    )
                ]
            })
            .catch(console.error);

        return true;
    }
}
