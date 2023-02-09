import mongoose, { model, Schema, Types } from 'mongoose';

export default interface Transaction {
    _id: Types.ObjectId,
    viewingPublickey: string;
    spendingPublickey: string;
    viewTag: string,
    stealthRecipient : String,
}

const transactionSchema = new Schema<Transaction>({
    viewingPublickey: { type: String, required: true, unique: true },
    spendingPublickey: { type: String, required: true },
    viewTag: { type: String, required: true },
    stealthRecipient: { type: String, required: true },
    


});
transactionSchema.index({ _id: 1, status: 1 });
// transactionSchema.index({ email: 1 });
// transactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<Transaction>('Transaction', transactionSchema);
