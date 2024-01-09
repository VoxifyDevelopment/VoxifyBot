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

import { ActivityType, EmbedBuilder, Guild, User } from 'discord.js';
import VoxifyClient from '../VoxifyClient';

export default () => {};

/**
 * Resolves the Discord activity type based on the provided string.
 * @param {string | undefined} typeString - The string representation of the activity type.
 * @returns {ActivityType} - The resolved activity type.
 */
export function resolveActivityType(typeString: string | undefined): ActivityType {
    let type: ActivityType = ActivityType.Playing;
    switch (typeString?.toUpperCase()) {
        default:
            type = ActivityType.Playing;
            break;
        case 'COMPETING':
            type = ActivityType.Competing;
            break;
        case 'WATCHING':
            type = ActivityType.Watching;
            break;
        case 'CUSTOM':
            type = ActivityType.Custom;
            break;
        case 'STREAMING':
            type = ActivityType.Streaming;
            break;
        case 'LISTENING':
            type = ActivityType.Listening;
            break;
    }
    return type;
}

export type EmbedType = 'success' | 'warning' | 'error' | 'info' | 'default';
export interface EmbedOptions {
    type: EmbedType;
    title?: string;
    content: string;
    guild?: Guild;
    user?: User;
    timestamp?: boolean | Date;
    footerAddition?: string;
    thumbnail?: string;
}

export async function generateEmbed(bot: VoxifyClient, options: EmbedOptions) {
    let embed = new EmbedBuilder();
    switch (options.type) {
        case 'success':
            embed.setColor('#008000');
            break;
        case 'warning':
            embed.setColor('#FFA500');
            break;
        case 'error':
            embed.setColor('#FF0000');
            break;
        case 'info':
            embed.setColor('#0000FF');
            break;
        default:
            embed.setColor('#808080');
            break;
    }

    embed.setDescription(options.content);
    embed.setFooter({
        text: `VoxifyBot | ShardId: ${bot.shardId}${
            options.footerAddition ? ` | ${options.footerAddition}` : ''
        }`,
        iconURL: (options.guild ? options.guild.iconURL() : bot.user?.displayAvatarURL()) || ''
    });
    embed.setThumbnail(options.thumbnail || bot.user?.displayAvatarURL() || '');
    embed.setURL('https://github.com/VoxifyDevelopment/VoxifyBot');

    if (options.title) embed.setTitle(options.title);

    if (options.timestamp != null) {
        if (options.timestamp != false && options.timestamp instanceof Date) {
            embed.setTimestamp(options.timestamp);
        } else {
            embed.setTimestamp();
        }
    }

    return embed;
}
