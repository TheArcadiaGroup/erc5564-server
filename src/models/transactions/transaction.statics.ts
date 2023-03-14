// import { IUserModel, IUserDocument } from "./transaction.types";
// export async function findOneOrCreate(this: IUserModel,  
//   registrant: string
// ): Promise<IUserDocument> {
//   const record = await this.findOne({ registrant });
//   if (record) {
//     return record;
//   } else {
//     return this.create({ registrant });
//   }
// }