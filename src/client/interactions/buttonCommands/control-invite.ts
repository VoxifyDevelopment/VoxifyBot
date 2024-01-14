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

import { ActionRowBuilder, GuildMember, PermissionFlagsBits, UserSelectMenuBuilder, UserSelectMenuInteraction } from 'discord.js';
import ButtonCommandExecutor, { ButtonCommandEvent } from '../../executors/ButtonCommandExecutor';

export default class btn implements ButtonCommandExecutor {
    async execute(event: ButtonCommandEvent) {
        const { bot, interaction } = event;
        if (!interaction.guild) return false;

        let guildLocaleName = interaction.guild?.preferredLocale.toLowerCase() || 'en-us';
        let localeName = bot.translations.translations[interaction.locale.toLowerCase()] ? interaction.locale.toLowerCase() : guildLocaleName;

        const resolvedArgs = await bot.tools.discord.resolveTempVoiceArgs(bot, interaction).catch(console.error);
        if (!resolvedArgs || resolvedArgs === true) {
            bot.out.debug('OUT: resolvedArgs not existent');
            return false;
        }

        if (
            !(await bot.tools.discord.checkTvcArgs(
                localeName,
                resolvedArgs,
                bot.translations.translateTo(localeName, 'buttons.invite.name'),
                bot,
                interaction,
                true,
                true,
                PermissionFlagsBits.CreateInstantInvite
            ))
        )
            return false;

        const { member, channel } = resolvedArgs;
        if (!channel) return true;

        const localizedName = bot.translations.translateTo(localeName, 'context.user.invite-user.name');

        let invites = await channel.fetchInvites(true);
        invites = invites.filter((i) => i.inviterId === bot.user?.id);

        let invite =
            invites.first() ||
            (await channel
                .createInvite({
                    reason: `TempVoice | invite requested by [user ${member.user.username}]`,
                    temporary: false
                })
                .catch(() => {}));

        if (!invite || typeof invite === 'function') {
            const feedback = bot.translations.translateTo(localeName, 'feedback.error');

            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'error',
                            content: `${feedback} ${localizedName}`,
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

        interaction.channel
            ?.awaitMessageComponent({
                filter: (collected) => collected.isUserSelectMenu() && collected.customId === 'select-invite-' + member.id,
                time: 60000
            })
            .then(async (selectInteraction) => {
                selectInteraction = selectInteraction as UserSelectMenuInteraction;
                const toInvite = selectInteraction.members;
                let usersInvited = [];
                let usersNotInvited = [];

                for (let [id, managedMember] of toInvite) {
                    if (!(managedMember instanceof GuildMember)) {
                        let mem = channel?.guild.members.cache.get(id) || (await channel?.guild.members.fetch(id).catch(console.error));
                        if (!mem || typeof mem === 'function') {
                            usersNotInvited.push(id);
                            continue;
                        }
                        managedMember = mem;
                    }

                    if (!channel) continue;

                    let targetLocale = interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

                    const sent = await managedMember
                        .send({
                            content: `${member.displayName} | <@!${member.id}> | <#${channel.id}>\n${invite?.url}`
                        })
                        .catch(() => {});

                    if (sent) {
                        usersInvited.push(managedMember.user.tag);
                    } else {
                        usersNotInvited.push(managedMember.user.tag);
                    }
                }

                const feedback = bot.translations.translateTo(localeName, 'feedback.success');

                selectInteraction
                    .reply({
                        embeds: [
                            await bot.tools.discord.generateEmbed(bot, {
                                type: 'success',
                                title: `${feedback} ${localizedName}`,
                                content: `
${usersNotInvited.length > 0 ? `❌ ${usersNotInvited.join(', ')}` : ''}
${usersInvited.length > 0 ? `✔️ ${usersInvited.join(', ')}` : ''}
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
                            .setCustomId('select-invite-' + member.id)
                    )
                ]
            })
            .catch(console.error);

        return true;
    }
}
