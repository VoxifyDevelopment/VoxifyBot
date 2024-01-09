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

import { Locale } from 'discord.js';
import MessagePlaceholderHandler, {
    MessagePlaceholderHandlerOptions
} from './MessagePlaceholderHandler';
import * as fs from 'fs';
import * as path from 'path';

export default class TranslationHandler {
    private placeholderHandler: MessagePlaceholderHandler = new MessagePlaceholderHandler();
    translations: { [langName: string]: { [key: string]: string } } = {};
    private fallback: { [key: string]: string } | undefined;

    constructor(defaultReplacements: MessagePlaceholderHandlerOptions) {
        this.placeholderHandler.addDefaultReplacements(defaultReplacements);
    }

    /**
     * Load language translations from JSON files in the specified folder and its subfolders.
     *
     * @param folderPath The path to the folder containing language JSON files.
     */
    loadTranslationsFromFolder(folderPath: string): void {
        try {
            const languageFolders: string[] = fs.readdirSync(folderPath);

            languageFolders.forEach((langName: string) => {
                const lowerLangName: string = langName.toLowerCase();
                const languageFolderPath: string = path.join(folderPath, langName);
                const translations: { [key: string]: string } = {};

                if (fs.statSync(languageFolderPath).isDirectory()) {
                    const files: string[] = this.readFilesRecursively(languageFolderPath);

                    files.forEach((filePath: string) => {
                        const relativePath: string = path.relative(languageFolderPath, filePath);
                        const key: string = this.getKeyFromPath(relativePath);
                        const data: string = fs.readFileSync(filePath, 'utf8');
                        const fileTranslations: { [key: string]: string } = JSON.parse(data);

                        // Merge translations into the current language object
                        Object.entries(fileTranslations).forEach(([fileKey, fileValue]) => {
                            const fullKey: string = key ? `${key}.${fileKey}` : fileKey;
                            translations[fullKey] = fileValue;
                        });

                        if (!this.fallback) {
                            this.fallback = translations;
                        }
                    });

                    this.translations[lowerLangName] = translations;
                }
            });

            // Set the default fallback properties based on the system's default locale
            if (this.translations['en-us']) {
                this.fallback = this.translations['en-us'];
            } else if (this.translations['en-gb']) {
                this.fallback = this.translations['en-gb'];
            }
        } catch (error) {
            console.error('Error loading translations from folder:', error);
        }
    }

    private readFilesRecursively(folderPath: string): string[] {
        const files: string[] = [];
        const entries: fs.Dirent[] = fs.readdirSync(folderPath, { withFileTypes: true });

        entries.forEach((entry: fs.Dirent) => {
            const fullPath: string = path.join(folderPath, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.readFilesRecursively(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                files.push(fullPath);
            }
        });

        return files;
    }

    private getKeyFromPath(filePath: string): string {
        const parts: string[] = filePath.split(path.sep);
        parts.pop();

        // Extract subfolder and filename separately
        const subfolder: string = parts.join('.');
        const filename: string = path.basename(filePath, '.json'); // Remove the extension

        const key = [subfolder, filename].filter(Boolean).join('.');
        // Concatenate subfolder and filename with a dot separator
        return key;
    }

    translate(key: string, ...args: any[]): string {
        const replace: MessagePlaceholderHandlerOptions = {
            ...this.placeholderHandler.getDefaultReplacements()
        };

        args.forEach((arg, i) => {
            replace[i.toString()] = arg;
        });

        return this.placeholderHandler.fastFormat(this.fallback?.[key] || key, replace);
    }

    translateTo(langName: string, key: string, ...args: any[]): string {
        const lowerLangName: string = langName.toLowerCase();

        const replace: MessagePlaceholderHandlerOptions = {
            ...this.placeholderHandler.getDefaultReplacements()
        };

        args.forEach((arg, i) => {
            replace[i.toString()] = arg;
        });

        // Check if translation for the specified language exists
        if (this.translations[lowerLangName]) {
            // Attempt to get the translation for the specified key
            const translation: string = this.translations[lowerLangName]?.[key];

            if (translation !== undefined) {
                // Attempt to resolve nested keys (e.g., en-GB.name)
                const resolvedTranslation: string = translation
                    .split('.')
                    .reduce<string>((obj, part) => {
                        if (obj && typeof obj === 'object' && part in obj) {
                            return obj[part] as unknown as string;
                        } else {
                            return '';
                        }
                    }, key);

                return this.placeholderHandler.fastFormat(
                    resolvedTranslation || translation,
                    replace
                );
            }
        }

        // Fallback to the default language
        const defaultTranslation: string = this.translate(key, args) || key;

        if (defaultTranslation !== undefined) {
            return this.placeholderHandler.fastFormat(defaultTranslation, replace);
        }

        // Fallback to the original key if no translation is found
        return this.placeholderHandler.fastFormat(key, args);
    }

    /**
     * Converts the lowercase suffix (including the hyphen) of a given string to uppercase.
     * If no hyphen is present, the entire string is converted to uppercase.
     *
     * @param input - The input string to be processed.
     * @returns The modified string with the lowercase suffix (including the hyphen) in uppercase.
     */
    uppercaseSuffix(input: string): string {
        // Find the last occurrence of the hyphen in the string
        const lastIndex = input.lastIndexOf('-');

        if (lastIndex !== -1) {
            // Separate the string into prefix and suffix
            const prefix = input.substring(0, lastIndex);
            const suffix = input.substring(lastIndex).toUpperCase();

            // Combine the prefix and the uppercase suffix
            return prefix + suffix;
        } else {
            // If no hyphen is found, convert the entire string to uppercase
            return input;
        }
    }

    initializeLocales = (): Record<Locale, string | null> => {
        const locales: Record<Locale, string | null> = {} as Record<Locale, string | null>;

        Object.keys(locales).forEach((locale) => {
            locales[locale as Locale] = null;
        });

        return locales;
    };
}
