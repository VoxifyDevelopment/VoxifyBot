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

export default class MessagePlaceholderHandler {
    private defaultReplacements: { [key: string]: any };

    constructor() {
        this.defaultReplacements = {};
    }

    fastFormat(format: string, values?: MessagePlaceholderHandlerOptions): string {
        const replacements = { ...this.getDefaultReplacements(), ...values };

        let formatter = format;
        const valueList: string[] = [];

        // pattern to allow any characters between ${ and }
        const pattern = /\$\{([^}]+)\}/g;
        let match = pattern.exec(format);

        while (match !== null) {
            const key = match[0];
            const index = formatter.indexOf(key);

            if (index !== -1) {
                formatter = formatter.replace(key, '%s');
                valueList.push(replacements[key.slice(2, -1)]);
            }

            match = pattern.exec(format);
        }

        const formatted = formatter.replace('%s', (...args) => String(valueList.shift()));
        return formatted;
    }

    addDefaultReplacements(additionalReplacements: MessagePlaceholderHandlerOptions): void {
        if (additionalReplacements) {
            this.defaultReplacements = { ...this.defaultReplacements, ...additionalReplacements };
        }
    }

    getDefaultReplacements(): { [key: string]: any } {
        return { ...this.defaultReplacements };
    }

    setDefaultReplacements(defaultReplacements: MessagePlaceholderHandlerOptions): void {
        this.defaultReplacements = { ...(defaultReplacements || {}) };
    }
}
