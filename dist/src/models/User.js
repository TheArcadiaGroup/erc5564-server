"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    viewingPublickey: { type: String, required: true, unique: true },
    spendingPublickey: { type: String, required: true },
});
userSchema.index({ _id: 1, status: 1 });
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map