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
    APIEmbedField,
    ActionRowBuilder,
    ActivityType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    Guild,
    GuildMember,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    PermissionResolvable,
    TextBasedChannel,
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
    url?: string;
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
        iconURL:
            (options.guild ? options.guild.iconURL() : bot.user?.displayAvatarURL()) ||
            'https://avatars.githubusercontent.com/u/155932207?s=220'
    });
    embed.setThumbnail(
        options.thumbnail ||
            bot.user?.displayAvatarURL() ||
            'https://avatars.githubusercontent.com/u/155932207?s=220'
    );

    if (options.url) {
        embed.setURL(options.url || 'https://github.com/VoxifyDevelopment/VoxifyBot');
    }

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
    checkManagement: boolean = true,
    checkChannel: boolean = true,
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

    if (checkChannel) {
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
    }

    // Check bot permissions
    if (botPerms && channel) {
        const bm = member.guild.members.cache.get(bot.user?.id || '');
        if (!bm) {
            await bot.tools.discord.tvcError('no-perm-bot', command, bot, localeName, interaction);
            return false;
        }
        const botPerform =
            bm.permissions.has(PermissionFlagsBits.Administrator) &&
            channel.permissionsFor(bm).has(botPerms);
        if (!botPerform) {
            await bot.tools.discord.tvcError('no-perm-bot', command, bot, localeName, interaction);
            return false;
        }
    }

    if (checkManagement && channel) {
        let ownerId = await bot.cache.redis.get(`tvc.${member.guild.id}.${channel.id}`);
        // Check user's permissions
        const perms = channel.permissionsFor(member);
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const isManager =
            perms.has(PermissionFlagsBits.ManageChannels) ||
            perms.has(PermissionFlagsBits.ManageGuild);
        const channelOwner = member.id === ownerId;

        if (!channelOwner && ownerOnly) {
            await bot.tools.discord.tvcError('not-your-tvc', command, bot, localeName, interaction);
            return false;
        }

        if (!channelOwner && !isAdmin && !isManager) {
            await bot.tools.discord.tvcError('no-perm', command, bot, localeName, interaction);
            return false;
        }
    }

    // Check additional conditions if a target is provided
    if (target && channel) {
        if (target.id === member.id && process.env.NODE_ENV === 'production') {
            await bot.tools.discord.tvcError(
                'target-yourself',
                command,
                bot,
                localeName,
                interaction
            );
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
            await bot.tools.discord.tvcError(
                'target-outside',
                command,
                bot,
                localeName,
                interaction
            );
            return false;
        }
    }

    // All checks passed
    return true;
}

export interface UrlButtonInfo {
    name: string;
    emoji: string;
    url: string;
}

export interface ButtonTypes {
    support: UrlButtonInfo;
    invite: UrlButtonInfo;
    github: UrlButtonInfo;
    translate: UrlButtonInfo;
}

export interface ButtonInfo {
    name: string;
    emoji: string;
    description: string;
}

export interface ControllerMenu {
    name: string;
    description: string;
    'error-message': string;
    'success-message': string;
    buttons: {
        rename: ButtonInfo;
        limit: ButtonInfo;
        bitrate: ButtonInfo;
        nsfw: ButtonInfo;
        status: ButtonInfo;
        kick: ButtonInfo;
        ban: ButtonInfo;
        invite: ButtonInfo;
        clear: ButtonInfo;
        close: ButtonInfo;
        lock: ButtonInfo;
        show: ButtonInfo;
        hide: ButtonInfo;
        public: ButtonInfo;
        private: ButtonInfo;
    };
}

let controlsCtx: ControllerMenu;
let linksCtx: ButtonTypes;

export async function generateTempVoiceControls(
    bot: VoxifyClient,
    interaction:
        | ButtonInteraction
        | ModalSubmitInteraction
        | CommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction
        | null,
    localeUser: string,
    localeGuild: string,
    show: boolean,
    channel?: TextBasedChannel | VoiceBasedChannel | null
) {
    if (!controlsCtx) controlsCtx = (await import('../../i18n/en-US/controls.json'))?.default || {};
    if (!linksCtx) linksCtx = (await import('../../i18n/en-US/links.json'))?.default || {};

    const finalShow = show && channel;
    const usedLocale = finalShow ? localeGuild : localeUser;
    let controlsEmbed = await bot.tools.discord.generateEmbed(bot, {
        type: 'success',
        title: await bot.translations.translateTo(usedLocale, 'controls.name'),
        content: await bot.translations.translateTo(usedLocale, 'controls.description'),
        timestamp: true
    });

    let buttonFields: APIEmbedField[] = [];
    const buttons: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

    for (const [key, value] of Object.entries(controlsCtx)) {
        if (currentRow.components.length === 5) {
            buttons.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
        const emoji = bot.translations.translateTo(usedLocale, `controls.buttons.${key}.emoji`);
        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`control-${key}`)
                .setEmoji(emoji)
                .setStyle(ButtonStyle.Secondary)
        );

        buttonFields.push({
            name: `[ ${emoji} ] «${bot.translations.translateTo(
                usedLocale,
                `controls.buttons.${key}.name`
            )}»`,
            value: bot.translations.translateTo(usedLocale, `controls.buttons.${key}.description`),
            inline: true
        });
    }

    controlsEmbed.addFields(buttonFields);

    for (const [key, value] of Object.entries(linksCtx)) {
        if (currentRow.components.length >= 2) {
            buttons.push(currentRow);
            currentRow = new ActionRowBuilder();
        }

        currentRow.addComponents(
            new ButtonBuilder()
                .setLabel(' ' + value.name)
                .setEmoji(value.emoji)
                .setURL(value.url)
                .setStyle(ButtonStyle.Link)
        );
    }

    // Add the last row if not empty
    if (currentRow.components.length > 0) {
        buttons.push(currentRow);
    }

    if (finalShow && interaction != null) {
        let message = await channel
            .send({
                embeds: [controlsEmbed],
                components: buttons
            })
            .catch(console.error);
        if (!message) {
            interaction
                .reply({
                    embeds: [
                        await bot.tools.discord.generateEmbed(bot, {
                            type: 'error',
                            content: await bot.translations.translateTo(
                                localeUser,
                                'controls.error-message'
                            ),
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
        interaction
            .reply({
                embeds: [
                    await bot.tools.discord.generateEmbed(bot, {
                        type: 'success',
                        content: await bot.translations.translateTo(
                            localeUser,
                            'controls.success-message'
                        ),
                        guild: interaction.guild || undefined,
                        user: interaction.user,
                        timestamp: true
                    })
                ],
                ephemeral: true
            })
            .catch(console.error);
    } else if (channel) {
        channel.send({
            embeds: [controlsEmbed],
            components: buttons
        });
    } else if (interaction) {
        interaction.reply({
            ephemeral: true,
            embeds: [controlsEmbed],
            components: buttons
        });
    }
}
