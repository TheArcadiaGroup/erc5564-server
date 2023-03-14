import { Schema } from "mongoose";
// export interface ISetting {
//     networkId : string,
//     lastBlockRequest: number;
//     lastBlockClaim: number;
// }

const TransactionSchema = new Schema({
    ephemeralPubKey : {type: String, require : true},
    stealthRecipientAndViewTag: {type: String, required: true},
    metadata: {type: String, required: true},
    stealthRecipient: {type: String, required: true},
    viewTag: {type: String, required: true},
    hash: {type: String, required: true},
    timestamps: {type: String, required: true},
}, { timestamps: false })
export default TransactionSchema

// export const Setting = model<ISetting>('setting', settingSchema);

// export interface ISettingDocument extends ISetting, Document {}
// export interface ISettingModel extends Model<ISetting> {}
