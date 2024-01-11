import * as fs from 'fs';
import VoxifyClient from './VoxifyClient';

const premiumFolder = __dirname + '/premium';

export default async function premiumCheckAndAdd(bot: VoxifyClient) {
    if (fs.existsSync(premiumFolder)) {
        bot.out.debug('Found premium folder...');
        const premium = await import(premiumFolder).catch(console.error);
        if (premium.default) {
            bot.out.debug('Found premium index...');
            premium.default(bot);
            return true;
        }
    }

    return false;
}
