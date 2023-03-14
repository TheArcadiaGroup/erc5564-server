import { Schema } from "mongoose";
// export interface ISetting {
//     networkId : string,
//     lastBlockRequest: number;
//     lastBlockClaim: number;
// }

const SettingSchema = new Schema({
    networkId : {type: String},
    lastBlockRequest: {type: Number, required: true},
    // lastBlockClaim: {type: Number, required: true}
}, { timestamps: false })
export default SettingSchema

// export const Setting = model<ISetting>('setting', settingSchema);

// export interface ISettingDocument extends ISetting, Document {}
// export interface ISettingModel extends Model<ISetting> {}
