import mongoose, { model, Schema, Types } from 'mongoose';

export default interface User {
    _id: Types.ObjectId,
    viewingPublickey: string;
    spendingPublickey: string;
}

const userSchema = new Schema<User>({
    viewingPublickey: { type: String, required: true, unique: true },
    spendingPublickey: { type: String, required: true },
});
userSchema.index({ _id: 1, status: 1 });
// userSchema.index({ email: 1 });
// userSchema.index({ status: 1 });

export const User = mongoose.model<User>('User', userSchema);
