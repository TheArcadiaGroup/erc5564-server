import { model } from "mongoose";
import { ISettingDocument } from "./setting.types"
import SettingSchema from "./setting.schema";
export const SettingModel = model<ISettingDocument>("setting", SettingSchema);
