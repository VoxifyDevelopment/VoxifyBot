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
        const valueList: any[] = [];

        const pattern = /\$\{(\w+)\}/g;
        let match = pattern.exec(format);

        while (match !== null) {
            const key = match[1];
            const formatKey = `\${${key}}`;
            const index = formatter.indexOf(formatKey);

            if (index !== -1) {
                formatter = formatter.replace(formatKey, '%s');
                valueList.push(replacements[key]);
            }

            match = pattern.exec(format);
        }

        return formatter.replace('%s', (...args) => String(valueList.shift()));
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
