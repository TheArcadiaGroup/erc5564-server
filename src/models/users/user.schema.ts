import { Schema } from "mongoose";
// export interface ISetting {
//     networkId : string,
//     lastBlockRequest: number;
//     lastBlockClaim: number;
// }

const UserSchema = new Schema({
    registrant : {type: String, require : true},
    generator: {type: String, required: true},
    spendingPubKey: {type: String, required: true},
    viewingPubKey: {type: String, required: true}

}, { timestamps: false })
export default UserSchema

// export const Setting = model<ISetting>('setting', settingSchema);

// export interface ISettingDocument extends ISetting, Document {}
// export interface ISettingModel extends Model<ISetting> {}
