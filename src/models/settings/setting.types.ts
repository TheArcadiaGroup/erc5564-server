import { Document, Model } from "mongoose";
export interface ISetting {
    networkId : string,
    lastBlockRequest: number;
    lastBlockClaim: number;
}
export interface ISettingDocument extends ISetting, Document {}
export interface ISettingModel extends Model<ISettingDocument> {}
