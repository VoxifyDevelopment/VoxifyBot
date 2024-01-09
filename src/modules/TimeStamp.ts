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

// Regular expression for matching date format tokens in the input string
const dateRegex = /(?=(YYYY|YY|MM|DD|HH|mm|ss|ms))\1([:\/]*)/g;

// Object mapping date format tokens to corresponding date functions and format lengths
const timeSpan: { [key: string]: [string, number, number?] } = {
    YYYY: ['getUTCFullYear', 4],
    YY: ['getUTCFullYear', 2],
    MM: ['getUTCMonth', 2, 1],
    DD: ['getUTCDate', 2],
    HH: ['getUTCHours', 2],
    mm: ['getUTCMinutes', 2],
    ss: ['getUTCSeconds', 2],
    ms: ['getUTCMilliseconds', 3]
};

/**
 * Generates a timestamp based on the given format and date.
 * @param {string|Date} formatOrDate - The format string or a Date object (optional).
 * @param {Date} date - The date object to use for generating the timestamp (optional).
 * @param {boolean} utc - If true, generates a UTC timestamp (optional).
 * @returns {string} - The formatted timestamp string.
 */
const TimeStamp = function (formatOrDate: string | Date, date = new Date(), utc = false): string {
    // If the format string is provided, use it; otherwise, default to 'YYYY-MM-DD'
    const format = typeof formatOrDate === 'string' ? formatOrDate : 'YYYY-MM-DD';

    // Replace date format tokens in the format string with corresponding values
    const formattedTimestamp = format.replace(/(YYYY|YY|MM|DD|HH|mm|ss|ms)/g, function (match) {
        return replaceDateToken(match, date, utc);
    });

    return formattedTimestamp;
};

/**
 * Replace date format tokens with corresponding values.
 * @param {string} token - The date format token to replace.
 * @param {Date} date - The date object.
 * @param {boolean} utc - If true, uses UTC methods.
 * @returns {string} - The replaced value.
 */
function replaceDateToken(token: string, date: { [key: string]: any }, utc: boolean): string {
    const [method, length, offset] = timeSpan[token];
    const value = utc ? date[method + 'UTC']() : date[method]();
    const adjustedValue = value + (offset || 0);

    // Adjust for local time zone offset when using non-UTC methods
    if (!utc && token === 'HH') {
        const localOffset = date.getTimezoneOffset() / 60; // in hours
        return padZero(adjustedValue - localOffset, length);
    }

    return padZero(adjustedValue, length);
}

/**
 * Pad a number with leading zeros if needed.
 * @param {number} num - The number to pad.
 * @param {number} length - The desired length of the padded string.
 * @returns {string} - The padded number as a string.
 */
function padZero(num: number, length: number): string {
    return num.toString().padStart(length, '0');
}

/**
 * Generates a UTC timestamp based on the given format and date.
 * @param {string|Date} str - The format string or a Date object (optional).
 * @param {Date} date - The date object to use for generating the timestamp (optional).
 * @returns {string} - The formatted UTC timestamp string.
 */
TimeStamp.utc = function (str: string | Date, date?: Date): string {
    return TimeStamp(str, date, true);
};

export default TimeStamp;
