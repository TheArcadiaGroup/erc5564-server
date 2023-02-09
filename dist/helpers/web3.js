"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const GenericBridge_json_1 = __importDefault(require("../contractABI/GenericBridge.json"));
const config = require('config');
let Web3Util = {
    getWeb3: (networkId) => __awaiter(void 0, void 0, void 0, function* () {
        let both = yield Web3Util.getWeb3AndRPC(networkId);
        return both.web3;
    }),
    getBridgeContract: (networkId) => __awaiter(void 0, void 0, void 0, function* () {
        let web3 = yield Web3Util.getWeb3(networkId);
        let contract = yield new web3.eth.Contract(GenericBridge_json_1.default, config.contracts[networkId].bridge);
        return contract;
    }),
    getWeb3AndRPC: (networkId) => __awaiter(void 0, void 0, void 0, function* () {
        let list = [];
        if (Array.isArray(config.blockchain[networkId].httpProvider)) {
            list = config.blockchain[networkId].httpProvider;
        }
        else {
            list.push(config.blockchain[networkId].httpProvider);
        }
        let len = list.length;
        let random = Math.floor(Math.random() * len);
        let rpc = list[random];
        return { web3: new web3_1.default(new web3_1.default.providers.HttpProvider(rpc)), rpc: rpc };
    }),
    getWeb3Socket: (networkId) => __awaiter(void 0, void 0, void 0, function* () {
        return new web3_1.default(new web3_1.default.providers.WebsocketProvider(config.get('blockchain')[networkId].wsProvider));
    }),
};
exports.default = Web3Util;
