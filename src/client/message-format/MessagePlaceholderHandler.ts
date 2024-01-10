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

export interface MessagePlaceholderHandlerOptions {
    [key: string]: any;
}

/**
 * MessagePlaceholderHandler class for handling message placeholders and replacements.
 * This class provides functionality to format strings with placeholders and replacements.
 * @class
 */
export default class MessagePlaceholderHandler {
    private defaultReplacements: { [key: string]: any };

    /**
     * Constructor for MessagePlaceholderHandler class.
     * Initializes an instance with an empty set of default replacements.
     * @constructor
     */
    constructor() {
        this.defaultReplacements = {};
    }

    /**
     * Formats a string with placeholders and replacements.
     * @param {string} format - The string format with placeholders.
     * @param {MessagePlaceholderHandlerOptions} values - Optional replacements for placeholders.
     * @returns {string} - The formatted string with applied replacements.
     */
    fastFormat(format: string, values?: MessagePlaceholderHandlerOptions): string {
        const replacements = { ...this.getDefaultReplacements(), ...values };
        // console.log(format);

        let formatter = format;
        const valueList: string[] = [];

        // pattern to allow any characters between ${ and }
        const pattern = /\$\{([^}]+)\}/g;
        let match = pattern.exec(format);

        while (match !== null) {
            const key = match[0];
            const index = formatter.indexOf(key);

            if (index !== -1) {
                // console.log(key, index);
                formatter = formatter.replace(key, '%s-' + valueList.length);
                valueList.push(replacements[key.slice(2, -1)]);
            }

            match = pattern.exec(format);
        }

        // console.log(valueList);

        for (let i = 0; i < valueList.length; i++) {
            formatter = formatter.replace('%s-' + i, valueList[i] || 'none');
        }

        // console.log(formatter);
        return formatter;
    }

    /**
     * Adds default replacements to the existing set.
     * @param {MessagePlaceholderHandlerOptions} additionalReplacements - Additional default replacements.
     */
    addDefaultReplacements(additionalReplacements: MessagePlaceholderHandlerOptions): void {
        if (additionalReplacements) {
            this.defaultReplacements = { ...this.defaultReplacements, ...additionalReplacements };
        }
    }

    /**
     * Retrieves a copy of the current default replacements.
     * @returns {MessagePlaceholderHandlerOptions} - Copy of the current default replacements.
     */
    getDefaultReplacements(): { [key: string]: any } {
        return { ...this.defaultReplacements };
    }

    /**
     * Sets the default replacements to a new set of replacements.
     * @param {MessagePlaceholderHandlerOptions} defaultReplacements - New set of default replacements.
     */
    setDefaultReplacements(defaultReplacements: MessagePlaceholderHandlerOptions): void {
        this.defaultReplacements = { ...(defaultReplacements || {}) };
    }
}
