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

const fs = require('fs').promises;
const path = require('path');
const micromatch = require('micromatch');
const chalk = require('chalk');

async function getCodeStatistics(rootDir, ignoreFile) {
    const stats = {};
    const ignored = (await fs.readFile(ignoreFile, 'utf8')).split(/\r?\n/g).filter((pattern) => pattern.trim() !== '');

    async function processFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.ts' || ext === '.js' || ext === '.json') {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            const codeStats = {
                totalLines: lines.length,
                codeLines: 0,
                commentLines: 0,
                whitespaceLines: 0
            };

            lines.forEach((line) => {
                const trimmedLine = line.trim();
                if (trimmedLine === '') {
                    codeStats.whitespaceLines++;
                } else if (trimmedLine.startsWith('//') || trimmedLine.startsWith(' *')) {
                    codeStats.commentLines++;
                } else {
                    codeStats.codeLines++;
                }
            });

            stats[ext] = stats[ext] || {
                count: 0,
                codeStats: {
                    totalLines: 0,
                    codeLines: 0,
                    commentLines: 0,
                    whitespaceLines: 0
                }
            };

            stats[ext].count++;
            stats[ext].codeStats.totalLines += codeStats.totalLines;
            stats[ext].codeStats.codeLines += codeStats.codeLines;
            stats[ext].codeStats.commentLines += codeStats.commentLines;
            stats[ext].codeStats.whitespaceLines += codeStats.whitespaceLines;
        }
    }

    async function traverseDirectory(dir) {
        const files = await fs.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);

            if (shouldIgnore(filePath, ignored) || filePath.includes('node_modules')) {
                continue;
            }

            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                await traverseDirectory(filePath);
            } else if (stat.isFile()) {
                await processFile(filePath);
            }
        }
    }

    function shouldIgnore(filePath, ignoreList) {
        return micromatch.some(filePath, ignoreList, { dot: true });
    }

    await traverseDirectory(rootDir);

    return stats;
}

function displayStatistics(statistics) {
    console.log(chalk.bold.underline('Code Statistics:'));
    console.log(chalk.gray('----------------------------------'));

    const totalStats = {
        count: 0,
        codeStats: {
            totalLines: 0,
            codeLines: 0,
            commentLines: 0,
            whitespaceLines: 0
        }
    };

    for (const ext in statistics) {
        const { count, codeStats } = statistics[ext];
        totalStats.count += count;
        totalStats.codeStats.totalLines += codeStats.totalLines;
        totalStats.codeStats.codeLines += codeStats.codeLines;
        totalStats.codeStats.commentLines += codeStats.commentLines;
        totalStats.codeStats.whitespaceLines += codeStats.whitespaceLines;
    }

    for (const ext in statistics) {
        const { count, codeStats } = statistics[ext];
        const percentage = ((count / totalStats.count) * 100).toFixed(2);

        console.log(`${chalk.cyan(ext)}: ${chalk.yellow(count)} files (${chalk.green(percentage)})`);
        console.log(`    - ${chalk.blue('Total Lines')}: ${codeStats.totalLines}`);
        console.log(
            `    - ${chalk.blue('Code Lines')}: ${codeStats.codeLines} | (${chalk.green(formatPercentage(codeStats.codeLines, codeStats.totalLines))})`
        );
        console.log(
            `    - ${chalk.blue('Comment Lines')}: ${codeStats.commentLines} | (${chalk.green(formatPercentage(codeStats.commentLines, codeStats.totalLines))})`
        );
        console.log(
            `    - ${chalk.blue('Whitespace Lines')}: ${codeStats.whitespaceLines} | (${chalk.green(
                formatPercentage(codeStats.whitespaceLines, codeStats.totalLines)
            )})`
        );
    }

    console.log(chalk.gray('----------------------------------'));

    const totalPercentage = formatPercentage(totalStats.count, totalStats.codeStats.totalLines);
    console.log(chalk.bold(`Total: ${chalk.yellow(totalStats.count)} files (${totalPercentage})`));

    return statistics;
}

function writeStatisticsTxt(statistics) {
    const lines = [];

    lines.push('Code Statistics:');
    lines.push('----------------------------------');

    const totalStats = {
        count: 0,
        codeStats: {
            totalLines: 0,
            codeLines: 0,
            commentLines: 0,
            whitespaceLines: 0
        }
    };

    for (const ext in statistics) {
        const { count, codeStats } = statistics[ext];
        totalStats.count += count;
        totalStats.codeStats.totalLines += codeStats.totalLines;
        totalStats.codeStats.codeLines += codeStats.codeLines;
        totalStats.codeStats.commentLines += codeStats.commentLines;
        totalStats.codeStats.whitespaceLines += codeStats.whitespaceLines;
    }

    for (const ext in statistics) {
        const { count, codeStats } = statistics[ext];
        const percentage = ((count / totalStats.count) * 100).toFixed(2);

        lines.push(`${ext}: ${count} files (${percentage})`);
        lines.push(`    - Total Lines: ${codeStats.totalLines}`);
        lines.push(`    - Code Lines: ${codeStats.codeLines} | (${formatPercentage(codeStats.codeLines, codeStats.totalLines)})`);
        lines.push(`    - Comment Lines: ${codeStats.commentLines} | (${formatPercentage(codeStats.commentLines, codeStats.totalLines)})`);
        lines.push(`    - Whitespace Lines: ${codeStats.whitespaceLines} | (${formatPercentage(codeStats.whitespaceLines, codeStats.totalLines)})`);
    }

    lines.push('----------------------------------');

    const totalPercentage = formatPercentage(totalStats.count, totalStats.codeStats.totalLines);
    lines.push(`Total: ${totalStats.count} files (${totalPercentage})`);

    fs.writeFile('./statistics.txt', lines.join('\n'), 'utf-8');

    return true;
}

function writeStatisticsMd(statistics) {
    const lines = [];

    lines.push('# Code Statistics');
    lines.push('');
    lines.push('| Language | Files | Total Lines | Code Lines | Comment Lines | Whitespace Lines |');
    lines.push('|----------|-------|-------------|------------|---------------|-------------------|');

    const totalStats = {
        count: 0,
        codeStats: {
            totalLines: 0,
            codeLines: 0,
            commentLines: 0,
            whitespaceLines: 0
        }
    };

    for (const ext in statistics) {
        const { count, codeStats } = statistics[ext];
        totalStats.count += count;
        totalStats.codeStats.totalLines += codeStats.totalLines;
        totalStats.codeStats.codeLines += codeStats.codeLines;
        totalStats.codeStats.commentLines += codeStats.commentLines;
        totalStats.codeStats.whitespaceLines += codeStats.whitespaceLines;

        const percentage = ((count / totalStats.count) * 100).toFixed(2);

        lines.push(
            `| ${capitalize(ext)} | ${count} | ${codeStats.totalLines} | ${codeStats.codeLines} | ${codeStats.commentLines} | ${codeStats.whitespaceLines} |`
        );
    }

    lines.push(
        `| **Total** | **${totalStats.count}** | **${totalStats.codeStats.totalLines}** | **${totalStats.codeStats.codeLines}** | **${totalStats.codeStats.commentLines}** | **${totalStats.codeStats.whitespaceLines}** |`
    );

    lines.push('\n---\n');

    fs.writeFile('./statistics.md', lines.join('\n'), 'utf-8');

    return true;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPercentage(value, total) {
    return `${((value / total) * 100).toFixed(2)}%`;
}

// Specify the root directory and ignore file
const rootDirectory = './';
const ignoreFile = '.statsignore';

// Get code statistics
if (process.argv.includes('--print') && process.argv.includes('--write')) {
    getCodeStatistics(rootDirectory, ignoreFile)
        .then(displayStatistics)
        .then(process.argv.includes('--txt') ? writeStatisticsTxt : writeStatisticsMd)
        .catch((error) => console.error(chalk.red('Error:'), error));
} else if (process.argv.includes('--write')) {
    getCodeStatistics(rootDirectory, ignoreFile)
        .then(process.argv.includes('--txt') ? writeStatisticsTxt : writeStatisticsMd)
        .catch((error) => console.error(chalk.red('Error:'), error));
} else {
    getCodeStatistics(rootDirectory, ignoreFile)
        .then(displayStatistics)
        .catch((error) => console.error(chalk.red('Error:'), error));
}
