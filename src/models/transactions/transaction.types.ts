import { Document, Model } from "mongoose";
export interface ITransaction {
    ephemeralPubKey : string,
    stealthRecipientAndViewTag: string;
    metadata: string;
    stealthRecipient: string;
    viewTag: string;
    hash: string;
    timestamps: string;
}
export interface ITransactionDocument extends ITransaction, Document {}
export interface ITransactionModel extends Model<ITransactionDocument> {}
