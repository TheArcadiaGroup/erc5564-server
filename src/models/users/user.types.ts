import { Document, Model } from "mongoose";
export interface IUser {
    registrant : string,
    generator: string;
    spendingPubKey: string;
    viewingPubKey : string;
}
export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}
