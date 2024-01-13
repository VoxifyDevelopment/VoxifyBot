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

export default () => {};

export function isEmptyString(str: string): boolean {
    return !str;
}

/**
 * Runs a given function at a random interval between a minimum and maximum delay.
 * @param {number} minDelay - The minimum delay (in milliseconds) between function calls.
 * @param {number} maxDelay - The maximum delay (in milliseconds) between function calls.
 * @param {() => void} intervalFunction - The function to be run at each interval.
 * @returns {Promise<boolean>} - A Promise resolving to `true` once the initial interval is set.
 */
export async function randomInterval(
    minDelay: number,
    maxDelay: number,
    intervalFunction: () => void
): Promise<boolean> {
    /**
     * Helper function to generate a random number between two given values.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} - A random number between the specified range.
     */
    const getRandomNumberBetween = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Function to run the interval function and create a new random interval.
     */
    const runFunction = (): void => {
        intervalFunction();
        createRandomInterval();
    };

    /**
     * Function to create a new random interval using setTimeout.
     */
    const createRandomInterval = (): void => {
        setTimeout(runFunction, getRandomNumberBetween(minDelay, maxDelay));
    };

    // Start the interval by creating the first random interval
    createRandomInterval();

    // Resolve the Promise with true once the initial interval is set
    return Promise.resolve(true);
}

/**
 * This function takes an input number of milliseconds and returns the number of days.
 * @param {number} milliseconds - The input number of milliseconds.
 * @returns {number} - The number of days.
 */
export function msToDays(milliseconds: number): number {
    return milliseconds / 1000 / 60 / 60 / 24;
}

/**
 * This function generates a random integer within a specified range.
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (inclusive).
 * @returns {number} - The randomly generated integer.
 */
export function randomMinMax(min: number, max: number): number {
    if (min >= max) throw new Error('Max must be greater than min.');
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Converts a hexadecimal string to a decimal number.
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {number} - The decimal representation of the hexadecimal string.
 */
export function hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
}

/**
 * This function checks if the input is an array.
 * @param {any} toCheckVar - The variable to check.
 * @returns {boolean} - Returns true if the input is an array, otherwise false.
 */
export function isArray(toCheckVar: any): boolean {
    return toCheckVar !== null && Array.isArray(toCheckVar);
}

/**
 * Check if a given string is a URL.
 * @param {string} str - The input string to check.
 * @returns {boolean} - Returns true if the input is a URL, otherwise false.
 */
export function isUrl(str: string): boolean {
    try {
        let url = new URL(str);
    } catch (err) {
        return false;
    }
    return true;
}

/**
 * This function generates a random color as a hex string.
 * It takes an optional brightness parameter to ensure minimum brightness.
 * @param {number} brightness - The brightness parameter (optional).
 * @returns {string} - The generated random color as a hex string.
 */
export function randomColor(brightness: number = 0): string {
    function randomChannel(brightness: number): string {
        var r = 255 - brightness;
        var n = 0 | (Math.random() * r + brightness);
        var s = n.toString(16);
        return s.length == 1 ? '0' + s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}

/**
 * This function formats a number as a US dollar currency string.
 * @param {number} number - The number to format (default is 0).
 * @returns {string} - The formatted number as a US dollar currency string.
 */
export function niceNumber(number: number = 0): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
}

/**
 * Pads a number with leading zeros if it has fewer digits than a specified number of digits.
 * @param {number} n - The number to pad.
 * @param {number} z - The number of digits to pad with leading zeros (default is 2).
 * @returns {string} - The padded number as a string.
 */
function timePad(n: number, z: number = 2): string {
    const digits = n.toString().length;
    if (digits >= z) {
        return n.toString();
    }
    const zeros = '0'.repeat(z - digits);
    return zeros + n.toString();
}

/**
 * Converts milliseconds to a human-readable time string array, considering years, months, weeks, days, hours, minutes, seconds, and optionally milliseconds.
 * Stops producing output after a certain count.
 *
 * @param milliseconds - The number of milliseconds to convert.
 * @param includeMilliseconds - Whether to include milliseconds in the output (default is false).
 * @param count - The count to limit the output (default is Infinity, i.e., no limit).
 * @param locale - A string with a BCP 47 language tag, or an array of such strings.
 *                 Examples: 'en-US', 'fr-FR', ['de-DE', 'en-US'].
 * @returns An array representing the time in years, months, weeks, days, hours, minutes, seconds, and optionally milliseconds, with counts.
 */
export function msToTimeString(
    milliseconds: number,
    includeMilliseconds: boolean = false,
    count: number = Infinity,
    locale: string | string[] = 'en'
): string[] {
    const timePad = (value: number, unit: string): string => {
        const roundedValue = Math.round(value);
        const formattedValue = new Intl.NumberFormat(locale).format(roundedValue);
        return `${formattedValue} ${unit}`;
    };

    const millisecondsInSecond = 1000;
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInWeek = 604800;
    const secondsInMonth = 2628000; // Assuming 30 days in a month
    const secondsInYear = 31536000; // Assuming 365 days in a year

    let remainingMilliseconds = milliseconds;

    const years = Math.floor(remainingMilliseconds / (secondsInYear * millisecondsInSecond));
    remainingMilliseconds %= secondsInYear * millisecondsInSecond;

    const months = Math.floor(remainingMilliseconds / (secondsInMonth * millisecondsInSecond));
    remainingMilliseconds %= secondsInMonth * millisecondsInSecond;

    const weeks = Math.floor(remainingMilliseconds / (secondsInWeek * millisecondsInSecond));
    remainingMilliseconds %= secondsInWeek * millisecondsInSecond;

    const days = Math.floor(remainingMilliseconds / (secondsInDay * millisecondsInSecond));
    remainingMilliseconds %= secondsInDay * millisecondsInSecond;

    const hours = Math.floor(remainingMilliseconds / (secondsInHour * millisecondsInSecond));
    remainingMilliseconds %= secondsInHour * millisecondsInSecond;

    const minutes = Math.floor(remainingMilliseconds / (secondsInMinute * millisecondsInSecond));
    remainingMilliseconds %= secondsInMinute * millisecondsInSecond;

    const seconds = Math.floor(remainingMilliseconds / millisecondsInSecond);
    remainingMilliseconds %= millisecondsInSecond;

    const timeUnits: string[] = [];

    if (count > 0 && years > 0) {
        timeUnits.push(timePad(years, years === 1 ? 'year' : 'years'));
        count--;
    }
    if (count > 0 && months > 0) {
        timeUnits.push(timePad(months, months === 1 ? 'month' : 'months'));
        count--;
    }
    if (count > 0 && weeks > 0) {
        timeUnits.push(timePad(weeks, weeks === 1 ? 'week' : 'weeks'));
        count--;
    }
    if (count > 0 && days > 0) {
        timeUnits.push(timePad(days, days === 1 ? 'day' : 'days'));
        count--;
    }
    if (count > 0 && hours > 0) {
        timeUnits.push(timePad(hours, hours === 1 ? 'hour' : 'hours'));
        count--;
    }
    if (count > 0 && minutes > 0) {
        timeUnits.push(timePad(minutes, minutes === 1 ? 'minute' : 'minutes'));
        count--;
    }
    if (count > 0 && seconds > 0) {
        timeUnits.push(timePad(seconds, seconds === 1 ? 'second' : 'seconds'));
        count--;
    }
    if (count > 0 && includeMilliseconds && remainingMilliseconds > 0) {
        timeUnits.push(timePad(remainingMilliseconds, 'milliseconds'));
        count--;
    }

    return timeUnits;
}

/**
 * Pauses the execution for a specified duration.
 *
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A Promise that resolves after the specified duration.
 */
export async function sleepAsync(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pauses the execution for a specified duration.
 *
 * @param {number} ms - The number of milliseconds to sleep.
 */
export function sleep(ms: number): void {
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms);
}
