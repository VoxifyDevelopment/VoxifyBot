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
    ActivityType,
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    Guild,
    GuildMember,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    PermissionResolvable,
    User,
    UserContextMenuCommandInteraction,
    VoiceBasedChannel
} from 'discord.js';
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
// Defines the types of embeds that can be generated
export type EmbedType = 'success' | 'warning' | 'error' | 'info' | 'default';

// Options for generating embeds
export interface EmbedOptions {
    type: EmbedType; // Type of the embed (success, warning, error, info, default)
    title?: string; // Optional title for the embed
    content: string; // Content of the embed
    guild?: Guild; // Discord guild associated with the embed
    user?: User; // Discord user associated with the embed
    timestamp?: boolean | Date; // Whether to include a timestamp in the embed
    footerAddition?: string; // Additional text for the footer
    thumbnail?: string; // URL for the thumbnail image
}

/**
 * Generates a Discord embed based on the provided options.
 * @param {VoxifyClient} bot - The Discord bot client.
 * @param {EmbedOptions} options - The options for generating the embed.
 * @returns {Promise<EmbedBuilder>} A Promise that resolves to the generated EmbedBuilder instance.
 */
export async function generateEmbed(
    bot: VoxifyClient,
    options: EmbedOptions
): Promise<EmbedBuilder> {
    // Create a new EmbedBuilder instance
    let embed = new EmbedBuilder();

    // Set the embed color based on the specified type
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

    // Set the description, footer, thumbnail, and URL for the embed
    embed.setDescription(options.content);
    embed.setFooter({
        text: `VoxifyBot | ShardId: ${bot.shardId}${
            options.footerAddition ? ` | ${options.footerAddition}` : ''
        }`,
        iconURL: (options.guild ? options.guild.iconURL() : bot.user?.displayAvatarURL()) || ''
    });
    embed.setThumbnail(options.thumbnail || bot.user?.displayAvatarURL() || '');
    embed.setURL('https://github.com/VoxifyDevelopment/VoxifyBot');

    // Set the title if provided
    if (options.title) embed.setTitle(options.title);

    // Set the timestamp if specified
    if (options.timestamp != null) {
        if (options.timestamp != false && options.timestamp instanceof Date) {
            embed.setTimestamp(options.timestamp);
        } else {
            embed.setTimestamp();
        }
    }

    // Return the generated embed
    return embed;
}

/**
 * Resolves temporary voice arguments for various interaction types.
 * @param {VoxifyClient} bot - The Discord bot client.
 * @param {ButtonInteraction | ModalSubmitInteraction | CommandInteraction |
 *     UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction} interaction - The interaction object.
 * @returns {Promise<{ member: GuildMember, channel: VoiceChannel } | boolean>}
 *     A Promise that resolves to an object containing the resolved member and voice channel, or false if resolution fails.
 */
export async function resolveTempVoiceArgs(
    bot: VoxifyClient,
    interaction:
        | ButtonInteraction
        | ModalSubmitInteraction
        | CommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction
): Promise<{ member: GuildMember; channel: VoiceBasedChannel | null } | boolean> {
    // Get the user ID from the interaction's member
    const userId = interaction.member?.user.id;
    if (!userId) {
        // If no user ID is found, return false
        return false;
    }

    // Fetch the member from the guild using the user ID
    let member =
        interaction.guild?.members.cache.get(userId) ||
        (await interaction.guild?.members.fetch(userId).catch(console.error));

    // If no member is found or it's not a GuildMember instance, return false
    if (!member || !(member instanceof GuildMember)) {
        return false;
    }

    // Ensure member is of type GuildMember
    member = member as GuildMember;

    // Return an object with the resolved member and voice channel
    return { member, channel: member.voice.channel };
}

export async function tvcError(
    messageKey: string,
    command: string,
    bot: VoxifyClient,
    localeName: string,
    interaction:
        | ButtonInteraction
        | ModalSubmitInteraction
        | CommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction
) {
    const feedback = bot.translations.translateTo(localeName, 'feedback.error');
    const content = bot.translations.translateTo(localeName, 'errors.tvc', {
        error: bot.translations.translateTo(localeName, `errors.${messageKey}`)
    });

    interaction
        .reply({
            embeds: [
                await bot.tools.discord.generateEmbed(bot, {
                    type: 'error',
                    title: `${feedback} | ${command}`,
                    content,
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

/**
 * Checks the arguments for a temporary voice channel command.
 * @param {string} localeName - The locale name for localization.
 * @param {{ member: GuildMember; channel: VoiceBasedChannel | null }} args - The command arguments.
 * @param {string} command - The name of the command.
 * @param {VoxifyClient} bot - The Discord bot client.
 * @param {ButtonInteraction | ModalSubmitInteraction | CommandInteraction |
 *         UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction} interaction - The interaction object.
 * @param {PermissionResolvable} [botPerms] - The required bot permissions.
 * @param {GuildMember} [target] - The target user for the command (optional).
 * @param {boolean} [ownerOnly=false] - Indicates if the command can only be executed by the channel owner.
 * @returns {Promise<boolean>} A Promise that resolves to true if the arguments are valid, or false otherwise.
 */
export async function checkTvcArgs(
    localeName: string,
    args: { member: GuildMember; channel: VoiceBasedChannel | null },
    command: string,
    bot: VoxifyClient,
    interaction:
        | ButtonInteraction
        | ModalSubmitInteraction
        | CommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction,
    botPerms?: PermissionResolvable,
    target?: GuildMember,
    ownerOnly: boolean = false
) {
    const { member, channel } = args;

    // Check if member exists
    if (!member) {
        await bot.tools.discord.tvcError('failed-fetch', command, bot, localeName, interaction);
        return false;
    }

    // Check if voice channel exists
    if (!channel) {
        await bot.tools.discord.tvcError('no-vc', command, bot, localeName, interaction);
        return false;
    }

    // Check if the channel is a temporary voice channel
    let ownerId = await bot.cache.redis.get(`tvc.${member.guild.id}.${channel.id}`);
    const isTempChannel = ownerId != null && !bot.tools.general.isEmptyString(ownerId);

    if (!isTempChannel) {
        await bot.tools.discord.tvcError('no-tvc', command, bot, localeName, interaction);
        return false;
    }

    // Check bot permissions
    const bm = channel.guild.members.cache.get(bot.user?.id || '');
    if (!bm) {
        await bot.tools.discord.tvcError('no-perm-bot', command, bot, localeName, interaction);
        return false;
    }
    const botPerform =
        bm.permissions.has(PermissionFlagsBits.Administrator) && botPerms
            ? channel.permissionsFor(bm).has(botPerms)
            : true;
    if (!botPerform) {
        await bot.tools.discord.tvcError('no-perm-bot', command, bot, localeName, interaction);
        return false;
    }

    // Check user's permissions
    const perms = channel.permissionsFor(member);
    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
    const isManager =
        perms.has(PermissionFlagsBits.ManageChannels) || perms.has(PermissionFlagsBits.ManageGuild);
    const channelOwner = member.id === ownerId;

    if (!channelOwner && ownerOnly) {
        await bot.tools.discord.tvcError('not-your-tvc', command, bot, localeName, interaction);
        return false;
    }

    if (!channelOwner && !isAdmin && !isManager) {
        await bot.tools.discord.tvcError('no-perm', command, bot, localeName, interaction);
        return false;
    }

    // Check additional conditions if a target is provided
    if (!target) return true;

    if (target.id === member.id && process.env.NODE_ENV === 'production') {
        await bot.tools.discord.tvcError('target-yourself', command, bot, localeName, interaction);
        return false;
    }

    if (target.user.bot && process.env.NODE_ENV === 'production') {
        await bot.tools.discord.tvcError('bots-ignored', command, bot, localeName, interaction);
        return false;
    }

    if (
        (target.permissions.has(PermissionFlagsBits.Administrator) ||
            target.permissions.has(PermissionFlagsBits.ManageGuild)) &&
        process.env.NODE_ENV === 'production'
    ) {
        await bot.tools.discord.tvcError('target-power', command, bot, localeName, interaction);
        return false;
    }

    if (target.voice.channel?.id !== channel.id) {
        await bot.tools.discord.tvcError('target-outside', command, bot, localeName, interaction);
        return false;
    }

    // All checks passed
    return true;
}
