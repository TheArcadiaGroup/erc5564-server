import { ISettingModel, ISettingDocument } from "./setting.types";
export async function findOneOrCreate(this: ISettingModel,  
  networkId: string
): Promise<ISettingDocument> {
  const record = await this.findOne({ networkId });
  if (record) {
    return record;
  } else {
    return this.create({ networkId });
  }
}