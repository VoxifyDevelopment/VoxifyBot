import mongoose from 'mongoose';

interface VoxifyGuildSettingsDocument extends mongoose.Document {
    id: string;
    locale: string;
}

const VoxifyGuildSettingsSchema = new mongoose.Schema<VoxifyGuildSettingsDocument>(
    {
        id: { type: String, unique: true, index: true, required: true },
        locale: { type: String, required: true, default: 'en' }
    },
    { timestamps: true, collection: 'guild_settings' }
);

export const VoxifyGuildSettings =
    mongoose.models.VoxifyGuildSettings ||
    mongoose.model<VoxifyGuildSettingsDocument>('VoxifyGuildSettings', VoxifyGuildSettingsSchema);

export default VoxifyGuildSettings;
