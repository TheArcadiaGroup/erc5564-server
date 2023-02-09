"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    viewingPublickey: { type: String, required: true, unique: true },
    spendingPublickey: { type: String, required: true },
    viewTag: { type: String, required: true },
    stealthAddress: { type: String, required: true },
});
transactionSchema.index({ _id: 1, status: 1 });
exports.Transaction = (0, mongoose_1.model)('Transaction', transactionSchema);
//# sourceMappingURL=Transaction.js.map