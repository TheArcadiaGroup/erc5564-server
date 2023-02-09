import mongoose, { model, Schema, Types } from 'mongoose';
export default interface Setting {
    lastBlockRequest: number;
    lastBlockClaim: number;
}

const settingSchema = new Schema<Setting>({
    lastBlockRequest: {type: Number, required: true},
    lastBlockClaim: {type: Number, required: true}
}, { timestamps: false })

export const Setting = mongoose.model<Setting>('Setting', settingSchema);
