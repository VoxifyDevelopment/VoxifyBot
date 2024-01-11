import * as fs from 'fs';
import VoxifyClient from './VoxifyClient';

const premiumFolder = './premium';
const premiumIndex =
    process.env.NODE_ENV === 'production' ? './premium/index.js' : './premium/index.ts';

export default async function premiumCheckAndAdd(bot: VoxifyClient) {
    if (fs.existsSync(premiumFolder) && fs.existsSync(premiumIndex)) {
        const premium = await import(premiumIndex).catch(console.error);
        if (premium.default) {
            premium.default(bot);
            return true;
        }
    }

    return false;
}
