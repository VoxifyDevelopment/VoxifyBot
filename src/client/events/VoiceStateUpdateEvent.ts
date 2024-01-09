import { VoiceState } from 'discord.js';
import VoxifyClient from '../VoxifyClient';

export default class VoiceStateUpdateEvent {
    static async execute(bot: VoxifyClient, oldState: VoiceState, newState: VoiceState) {
        let guild = newState.guild;

        return true;
    }
}
