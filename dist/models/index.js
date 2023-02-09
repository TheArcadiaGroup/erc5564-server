"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose = require('mongoose');
const db = {};
const config = require('config');
// in validator node dont need store db info
mongoose.Promise = global.Promise;
// mongoose.set('useCreateIndex', true)
mongoose.set('strictQuery', true);
let networkTocrawl = config.networkTocrawl;
console.log(networkTocrawl);
let linkdb = config["db"].uri[networkTocrawl];
// let linkdbx = linkdb[networkTocrawl]
// console.log(linkdbx)
console.log(linkdb);
mongoose.connect(linkdb, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
        console.error('Mongodb Connection error!!!');
        process.exit();
    }
});
// import all file in this dir, except index.js
fs_1.default.readdirSync(__dirname)
    .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
})
    .forEach(function (file) {
    var model = require(path_1.default.join(__dirname, file));
    db[model.modelName] = model;
});
exports.default = db;
