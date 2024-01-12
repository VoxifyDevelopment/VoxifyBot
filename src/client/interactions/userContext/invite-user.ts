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
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    InviteTargetType,
    Locale,
    PermissionFlagsBits
} from 'discord.js';
import VoxifyClient from '../../VoxifyClient';
import { UserContextMenuInteractionEvent } from '../../events/EventManager';
import UserContextMenuExecutor from '../../executors/UserContextMenuExecutor';

export default class context implements UserContextMenuExecutor {
    id = (bot: VoxifyClient, localeName?: string) =>
        localeName
            ? bot.translations.translateTo(localeName, 'context.user.invite-user.name')
            : bot.translations.translate('context.user.invite-user.name');
    data(bot: VoxifyClient) {
        const cmcBuilder = new ContextMenuCommandBuilder()
            .setType(ApplicationCommandType.User)
            .setDMPermission(false)
            .setName(bot.translations.translate('context.user.invite-user.name'));

        let names = bot.translations.initializeLocales();
        Object.entries(bot.translations.translations).forEach(([localeName, translation]) => {
            const normalizedLanguage = bot.translations.uppercaseSuffix(localeName);
            if (!Object.values(Locale).includes(normalizedLanguage as Locale)) return;
            let name = bot.translations.translateTo(
                normalizedLanguage,
                'context.user.invite-user.name'
            );
            names[normalizedLanguage as Locale] = name;
        });

        cmcBuilder.setNameLocalizations(names);

        return cmcBuilder.toJSON();
    }
    async execute(event: UserContextMenuInteractionEvent) {
        const { bot, interaction } = event;

        let localeName = bot.translations.translations[interaction.locale.toLowerCase()]
            ? interaction.locale.toLowerCase()
            : interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        const resolvedArgs = await bot.tools.discord
            .resolveTempVoiceArgs(bot, interaction)
            .catch(console.error);
        if (!resolvedArgs || resolvedArgs === true) {
            bot.out.debug('OUT: resolvedArgs not existent');
            return false;
        }

        const target = interaction.guild?.members.cache.get(interaction.targetUser.id);
        if (!target) return false;

        const localizedName = this.id(bot, localeName);

        if (
            !(await bot.tools.discord.checkTvcArgs(
                localeName,
                resolvedArgs,
                localizedName,
                bot,
                interaction,
                true,
                true,
                PermissionFlagsBits.MoveMembers
            ))
        )
            return false;

        const { member, channel } = resolvedArgs;

        if (!channel) return false;

        let invites = await channel.fetchInvites(true);
        invites = invites.filter((i) => i.inviterId === bot.user?.id);

        let invite =
            invites.first() ||
            (await channel
                .createInvite({
                    reason: `TempVoice | invite requested by [user ${member.user.username}]`,
                    temporary: false
                })
                .catch(console.error));

        if (!invite) {
            const feedback = bot.translations.translateTo(localeName, 'feedback.error');

            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'error',
                            title: `${feedback} ${localizedName}`,
                            content: `❌ ${target.displayName} | <@!${target.id}>`,
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

        let targetLocale = interaction.guild?.preferredLocale.toLowerCase() || 'en-us';

        const sent = await target
            .send({
                content: `${member.displayName} | <@!${member.id}> | <#${channel.id}>\n${invite?.url}`
            })
            .catch(() => {});

        if (!sent) {
            const feedback = bot.translations.translateTo(localeName, 'feedback.warning');

            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'warning',
                            title: `${feedback} ${localizedName}`,
                            content: `❌ DM ${target.displayName} | <@!${target.id}>`,
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

        const feedback = bot.translations.translateTo(localeName, 'feedback.success');

        interaction
            .reply({
                embeds: [
                    await bot.tools.discord.generateEmbed(bot, {
                        type: 'success',
                        title: `${feedback} ${localizedName}`,
                        content: `✔️ ${target.displayName} | <@!${target.id}>`,
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
