"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const express_1 = require("express");
const body_parser_1 = require("body-parser");
const cors_1 = require("cors");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Healthy");
});
app.use((0, cors_1.default)({ origin: "http://localhost:3000" }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
console.log(process.env.SECRET_CODE);
//# sourceMappingURL=index.js.map