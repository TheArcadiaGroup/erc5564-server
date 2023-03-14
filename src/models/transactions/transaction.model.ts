import { model } from "mongoose";
import { ITransactionDocument } from "./transaction.types"
import TransactionSchema from "./transaction.schema";
export const TransactionModel = model<ITransactionDocument>("transaction", TransactionSchema);
