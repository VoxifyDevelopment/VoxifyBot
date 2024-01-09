import TimeStamp from './TimeStamp';

export class TerminalTextFormat {
    static ESCAPE = '\u001b';

    static BLINK = TerminalTextFormat.ESCAPE + '[5m';
    static BLACK = TerminalTextFormat.ESCAPE + '[30m';
    static DARK_BLUE = TerminalTextFormat.ESCAPE + '[34m';
    static DARK_GREEN = TerminalTextFormat.ESCAPE + '[32m';
    static DARK_AQUA = TerminalTextFormat.ESCAPE + '[36m';
    static DARK_RED = TerminalTextFormat.ESCAPE + '[31m';
    static DARK_PURPLE = TerminalTextFormat.ESCAPE + '[35m';
    static GOLD = TerminalTextFormat.ESCAPE + '[33m';
    static GRAY = TerminalTextFormat.ESCAPE + '[37m';
    static DARK_GRAY = TerminalTextFormat.ESCAPE + '[30;1m';
    static BLUE = TerminalTextFormat.ESCAPE + '[34;1m';
    static GREEN = TerminalTextFormat.ESCAPE + '[32;1m';
    static AQUA = TerminalTextFormat.ESCAPE + '[36;1m';
    static RED = TerminalTextFormat.ESCAPE + '[31;1m';
    static LIGHT_PURPLE = TerminalTextFormat.ESCAPE + '[35;1m';
    static YELLOW = TerminalTextFormat.ESCAPE + '[33;1m';
    static WHITE = TerminalTextFormat.ESCAPE + '[37;1m';
    static OBFUSCATED = TerminalTextFormat.ESCAPE + '[47m';
    static BOLD = TerminalTextFormat.ESCAPE + '[1m';
    static STRIKETHROUGH = TerminalTextFormat.ESCAPE + '[9m';
    static UNDERLINE = TerminalTextFormat.ESCAPE + '[4m';
    static ITALIC = TerminalTextFormat.ESCAPE + '[3m';
    static RESET = TerminalTextFormat.ESCAPE + '[0m';
}

export class TextFormat {
    static ESCAPE = '&';

    // Mapping of text formatting styles to their corresponding '&' codes
    static BLACK = TextFormat.ESCAPE + '0';
    static DARK_BLUE = TextFormat.ESCAPE + '1';
    static DARK_GREEN = TextFormat.ESCAPE + '2';
    static DARK_AQUA = TextFormat.ESCAPE + '3';
    static DARK_RED = TextFormat.ESCAPE + '4';
    static DARK_PURPLE = TextFormat.ESCAPE + '5';
    static GOLD = TextFormat.ESCAPE + '6';
    static GRAY = TextFormat.ESCAPE + '7';
    static DARK_GRAY = TextFormat.ESCAPE + '8';
    static BLUE = TextFormat.ESCAPE + '9';
    static GREEN = TextFormat.ESCAPE + 'a';
    static AQUA = TextFormat.ESCAPE + 'b';
    static RED = TextFormat.ESCAPE + 'c';
    static LIGHT_PURPLE = TextFormat.ESCAPE + 'd';
    static YELLOW = TextFormat.ESCAPE + 'e';
    static WHITE = TextFormat.ESCAPE + 'f';
    static OBFUSCATED = TextFormat.ESCAPE + 'k';
    static BOLD = TextFormat.ESCAPE + 'l';
    static STRIKETHROUGH = TextFormat.ESCAPE + 'm';
    static UNDERLINE = TextFormat.ESCAPE + 'n';
    static ITALIC = TextFormat.ESCAPE + 'o';
    static RESET = TextFormat.ESCAPE + 'r';

    /**
     * Tokenize a string by splitting it into an array based on formatting codes.
     * @param str - The input string with formatting codes.
     * @returns An array of strings, representing the tokens after splitting.
     */
    static tokenize = (str: string): string[] => {
        return str
            .split(new RegExp('(' + TextFormat.ESCAPE + '[0123456789abcdefklmnor])'))
            .filter((v) => v !== '');
    };

    /**
     * Clean a string by removing text formatting codes and escape sequences.
     * @param str - The input string with formatting codes and escape sequences.
     * @param removeFormat - If true, remove formatting codes; if false, preserve formatting codes.
     * @returns The cleaned string without formatting codes and escape sequences.
     */
    static clean = (str: string, removeFormat = true): string => {
        if (removeFormat) {
            return str
                .replace(new RegExp(TextFormat.ESCAPE + '[0123456789abcdefklmnor]', 'g'), '')
                .replace(/\x1b[\\(\\][[0-9;\\[\\(]+[Bm]/g, '')
                .replace(new RegExp(TextFormat.ESCAPE, 'g'), '');
        } else {
            return str.replace(/\x1b[\\(\\][[0-9;\\[\\(]+[Bm]/g, '').replace(/\x1b/g, '');
        }
    };

    /**
     * Converts a string formatted with '&' codes to its equivalent terminal-formatted string.
     * @param str - The input string with '&' codes for formatting.
     * @returns The terminal-formatted string.
     */
    static toTerminal = (str: string): string => {
        const tokens = TextFormat.tokenize(str);

        const formattedTokens = tokens.map((v) => {
            switch (v) {
                case TextFormat.BLACK:
                    return TerminalTextFormat.BLACK;
                case TextFormat.DARK_BLUE:
                    return TerminalTextFormat.DARK_BLUE;
                case TextFormat.DARK_GREEN:
                    return TerminalTextFormat.DARK_GREEN;
                case TextFormat.DARK_AQUA:
                    return TerminalTextFormat.DARK_AQUA;
                case TextFormat.DARK_RED:
                    return TerminalTextFormat.DARK_RED;
                case TextFormat.DARK_PURPLE:
                    return TerminalTextFormat.DARK_PURPLE;
                case TextFormat.GOLD:
                    return TerminalTextFormat.GOLD;
                case TextFormat.GRAY:
                    return TerminalTextFormat.GRAY;
                case TextFormat.DARK_GRAY:
                    return TerminalTextFormat.DARK_GRAY;
                case TextFormat.BLUE:
                    return TerminalTextFormat.BLUE;
                case TextFormat.GREEN:
                    return TerminalTextFormat.GREEN;
                case TextFormat.AQUA:
                    return TerminalTextFormat.AQUA;
                case TextFormat.RED:
                    return TerminalTextFormat.RED;
                case TextFormat.LIGHT_PURPLE:
                    return TerminalTextFormat.LIGHT_PURPLE;
                case TextFormat.YELLOW:
                    return TerminalTextFormat.YELLOW;
                case TextFormat.WHITE:
                    return TerminalTextFormat.WHITE;
                case TextFormat.BOLD:
                    return TerminalTextFormat.BOLD;
                case TextFormat.OBFUSCATED:
                    return TerminalTextFormat.OBFUSCATED;
                case TextFormat.ITALIC:
                    return TerminalTextFormat.ITALIC;
                case TextFormat.UNDERLINE:
                    return TerminalTextFormat.UNDERLINE;
                case TextFormat.STRIKETHROUGH:
                    return TerminalTextFormat.STRIKETHROUGH;
                case TextFormat.RESET:
                    return TerminalTextFormat.RESET;
                default:
                    return v;
            }
        });

        return formattedTokens.join('');
    };
}

/**
 * Represents a logging utility with various log levels and formatting options.
 */
export default class Logger {
    private debuggingLevel: number = 0;
    private caller: string;
    private subCaller: string;

    /**
     * Creates a new Logger instance.
     * @param caller - The main caller identifier.
     * @param subCaller - The optional sub-caller identifier.
     */
    constructor(caller: string, subCaller: string = '') {
        this.caller = caller;
        this.subCaller = subCaller !== '' ? ' ' + subCaller : '';
    }

    /**
     * Clears the console.
     */
    clear(): void {
        console.clear();
    }

    /**
     * Sets the debugging level for the logger.
     * @param level - The debugging level (0, 1, or 2).
     * @returns The current Logger instance.
     */
    setDebugging(level: number): Logger {
        this.debuggingLevel = level;
        return this;
    }

    /**
     * Outputs a log message with the specified log level, messages, and color.
     * @param level - The log level (e.g., 'Error', 'Info', 'Debug').
     * @param messages - The log messages.
     * @param color - The text color escape sequence.
     */
    private out(level: string, messages: any[], color: string = TerminalTextFormat.GRAY): void {
        if (messages.length === 0) return;

        messages = Array.from(messages).map(
            (message) =>
                (typeof message === 'string' ? TextFormat.toTerminal(message) : message) +
                TerminalTextFormat.RESET
        );

        this.print(
            TerminalTextFormat.BLUE +
                '[' +
                TimeStamp('DD.MM.YYYY HH:mm:ss') +
                ']' +
                TerminalTextFormat.RESET +
                ' ' +
                color +
                '[' +
                this.caller +
                ' > ' +
                level.toUpperCase() +
                ']:' +
                this.subCaller,
            messages
        );
    }

    /**
     * Outputs log messages to the console.
     * @param prefix - The prefix for the log message.
     * @param args - The log messages.
     */
    private print(prefix: string, args: any[]): void {
        console.log(prefix, ...args);
    }

    /**
     * Outputs an emergency-level log message with blinking red text.
     */
    emergency(...args: any[]): void {
        this.out('emergency', args, TerminalTextFormat.RED + TerminalTextFormat.BLINK);
    }

    /**
     * Outputs an alert-level log message with red text.
     */
    alert(...args: any[]): void {
        this.out('alert', args, TerminalTextFormat.RED);
    }

    /**
     * Outputs a critical-level log message with red text.
     */
    critical(...args: any[]): void {
        this.out('critical', args, TerminalTextFormat.RED);
    }

    /**
     * Outputs an error-level log message with dark red text.
     */
    error(...args: any[]): void {
        this.out('error', args, TerminalTextFormat.DARK_RED);
    }

    /**
     * Outputs a warning-level log message with yellow text.
     */
    warning(...args: any[]): void {
        this.out('warning', args, TerminalTextFormat.YELLOW);
    }

    /**
     * Alias for warning().
     */
    warn(...args: any[]): void {
        this.out('warn', args, TerminalTextFormat.YELLOW);
    }

    /**
     * Outputs a notice-level log message with dark green text.
     */
    notice(...args: any[]): void {
        this.out('notice', args, TerminalTextFormat.DARK_GREEN);
    }

    /**
     * Outputs an info-level log message with green text.
     */
    info(...args: any[]): void {
        this.out('info', args, TerminalTextFormat.GREEN);
    }

    /**
     * Outputs a general log message with white text.
     */
    log(...args: any[]): void {
        this.out('OUT', args, TerminalTextFormat.WHITE);
    }

    /**
     * Outputs a debug-level log message with aqua text, only if debugging level is at least 1.
     */
    debug(...args: any[]): void {
        if (this.debuggingLevel < 1) return;
        this.out('debug', args, TerminalTextFormat.AQUA);
    }

    /**
     * Outputs a request-level log message with gray text, only if debugging level is at least 1.
     */
    request(...args: any[]): void {
        if (this.debuggingLevel < 1) return;
        this.out('request', args, TerminalTextFormat.GRAY);
    }

    /**
     * Outputs an extensive debug-level log message with aqua text, only if debugging level is at least 2.
     */
    debugExtensive(...args: any[]): void {
        if (this.debuggingLevel < 2) return;
        this.out('debug', args, TerminalTextFormat.AQUA);
    }

    /**
     * Logs an error message along with its stack trace.
     * @param error - The Error object.
     */
    logError(error: Error): void {
        // const stack = error.stack?.split('\n') || [];
        // this.error(stack.shift());
        // stack.forEach(this.debug);
        console.error(error);
    }
}
