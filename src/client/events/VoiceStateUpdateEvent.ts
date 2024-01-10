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

import { ChannelType, PermissionFlagsBits, VoiceState } from 'discord.js';
import VoxifyClient from '../VoxifyClient';

export default class VoiceStateUpdateEvent {
    static async execute(bot: VoxifyClient, oldState: VoiceState, newState: VoiceState) {
        let guild = newState.guild;
        let member = newState.member;
        if (!member) return true;

        if (
            !guild.members.cache
                .get(bot.user?.id || '')
                ?.permissions.has(PermissionFlagsBits.ManageChannels)
        )
            return false; // early return if bot cannot manage channels

        let containerCached = await bot.cache.redis
            .get(`containerCached.${guild.id}`)
            .catch(console.error);
        if (!containerCached) return false;
        let lobbyCached = await bot.cache.redis.get(`lobbyCached.${guild.id}`).catch(console.error);
        if (!lobbyCached) return false;

        let oldChannel = oldState.channel;
        let newChannel = newState.channel;

        // invoke deletion
        if (oldChannel && oldChannel?.parent?.id === containerCached) {
            let data = await bot.cache.redis.get(`tvc.${guild.id}.${oldChannel.id}`);
            const isTempChannel = data != null && !bot.tools.general.isEmptyString(data);
            if (isTempChannel) {
                bot.cache.redis
                    .setEx(`tvc.${guild.id}.${oldChannel.id}`, 1, '')
                    .catch(console.error);

                if (oldChannel.members.size < 1) {
                    oldChannel
                        .delete(
                            `TempVoice | not needed anymore <emptyChannel> [last ${member.user.username}]`
                        )
                        .catch(console.error);
                    bot.out.debug(
                        `TempVoice | not needed anymore <emptyChannel> [last ${member.user.username}]`
                    );
                }
            }
        }

        if (newChannel && newChannel.id === lobbyCached) {
            let container =
                guild.channels.cache.get(containerCached) ||
                (await guild.channels.fetch(containerCached).catch(() => {}));

            if (!container || typeof container === 'function') return false;

            let channel = await guild.channels.create({
                name: member.displayName,
                parent: containerCached,
                type: ChannelType.GuildVoice,
                reason: `TempVoice | new channel needed for [user ${member.user.username}]`
            });
            bot.out.debug(`TempVoice | new channel needed for [user ${member.user.username}]`);

            bot.cache.redis.set(`tvc.${guild.id}.${channel.id}`, member.id).catch(console.error);
            member.voice.setChannel(channel);

            let guildLocaleName = guild.preferredLocale.toLowerCase();

            bot.tools.discord.generateTempVoiceControls(
                bot,
                null,
                guildLocaleName,
                guildLocaleName,
                true,
                channel
            );

            return true;
        }

        return true;
    }
}
