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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db = require('../models');
// const { check, validationResult, query } = require('express-validator')
require('dotenv').config();
const config = require('config');
const eventHelper = require('../helpers/event');
// const IERC20ABI = require('../contracts/ERC20.json')
const axios = require('axios');
const logger = require('../helpers/logger');
// const tokenHelper = require("../helpers/token");
// const GeneralHelper = require('../helpers/general')
router.get('/status', [], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return res.json({ status: 'ok' });
    });
});
router.get('/checkingStealthAddress/:address/:viewingPublicKey/:spendingPublickey', [], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = yield db.Transaction.find({});
        return res.json({
            transaction
        });
    });
});
// /**
//  * History of an account
//  *
//  * @param account wallet address
//  * @param networkId network id (or chain id) of EVM a network
//  * @param limit limit records per page
//  * @param page page want to see
//  * @returns object history of request/claim bridge
//  */
// router.get('/transactions/:account/:networkId', [
//     check('account').exists().isLength({ min: 42, max: 68 }).withMessage('address is incorrect.'),
//     check('networkId').exists().isNumeric({ no_symbols: true }).withMessage('networkId is incorrect'),
//     query('limit').isInt({ min: 0, max: 200 }).optional().withMessage('limit should greater than 0 and less than 200'),
//     query('page').isNumeric({ no_symbols: true }).optional().withMessage('page must be number')
// ], async function (req, res, next) {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }
//     let account = req.params.account.toLowerCase()
//     if (account.length != 42 && account.length != 68 && account.length != 66) {
//         return res.status(400).json({ errors: "invalid address" })
//     }
//     {
//         //check hex
//         let temp = account.replace("0x", "")
//         var re = /[0-9A-Fa-f]{6}/g;
//         if (!re.test(temp)) {
//             return res.status(400).json({ errors: "address must be hex" })
//         }
//         if (account.length == 68 || account.length == 66) {
//             if (account.substring(0, 2) != "01" && account.substring(0, 2) != "02") {
//                 return res.status(400).json({ errors: "invalid casper public key" })
//             }
//             // if (account.substring(2, 4) != "03" && account.substring(2, 4) != "02") {
//             //     return res.status(400).json({ errors: "invalid casper public key" })
//             // }
//             account = CasperHelper.fromCasperPubkeyToAccountHash(account)
//         }
//     }
//     let limit = (req.query.limit) ? parseInt(req.query.limit) : 20
//     let page = req.query.page || 1
//     let skip = limit * (page - 1)
//     let networkId = req.params.networkId
//     let query = {
//         $and: [
//             { $or: [{ txCreator: account }, { account: account }] },
//             { $or: [{ fromChainId: networkId }, { toChainId: networkId }] }
//         ]
//     }
//     let total = await db.Transaction.countDocuments(query)
//     let transactions = await db.Transaction.find(query).sort({ requestTime: -1 }).limit(limit).skip(skip).lean().exec()
//     for (const t of transactions) {
//         if (t.originToken == "0x1111111111111111111111111111111111111111") {
//             t.originDecimals = 18
//         } else {
//             let token = await tokenHelper.getToken(t.originToken, t.originChainId)
//             t.originDecimals = token.decimals
//         }
//     }
//     return res.json({
//         transactions: transactions,
//         page: page,
//         limit: limit,
//         total: total
//     })
// })
// router.get('/transaction-status/:requestHash/:fromChainId', [
//     check('requestHash').exists().withMessage('message is required'),
//     check('fromChainId').exists().isNumeric({ no_symbols: true }).withMessage('fromChainId is incorrect')
// ], async function (req, res, next) {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }
//     console.log('req', req.params)
//     let requestHash = req.params.requestHash
//     let fromChainId = req.params.fromChainId
//     let index = req.query.index ? req.query.index : 0
//     if (!req.query.index) {
//         {
//             //check transaction on-chain
//             if (fromChainId != casperConfig.networkId) {
//                 let transaction = await eventHelper.getRequestEvent(fromChainId, requestHash)
//                 if (!transaction || !transaction.requestHash) {
//                     //cant find transaction on-chain
//                     return res.status(400).json({ errors: "transaction not found" })
//                 }
//                 index = transaction.index
//             } else {
//                 transaction = await db.Transaction.findOne({ requestHash: requestHash, fromChainId: fromChainId })
//                 index = transaction.index
//             }
//         }
//     }
//     //read tx from the server itself
//     let requestData = `verify-transaction/${requestHash}/${fromChainId}/${index}`
//     let myself = `http://localhost:${config.server.port}/${requestData}`
//     let verifyRet = await axios.get(myself)
//     let myNodeResult = verifyRet.data
//     console.log('myNodeResult', myNodeResult)
//     const readStatus = async (i) => {
//         try {
//             console.log('reading from', config.signatureServer[i])
//             let ret = await axios.get(config.signatureServer[i] + `/${requestData}`, { timeout: 10 * 1000 })
//             ret = ret.data
//             console.log('reading from ret ', ret)
//             ret = ret.success ? ret.success : false
//             return { index: i, success: ret }
//         } catch (e) {
//             console.log('e', e.toString())
//         }
//         return { index: i, success: false }
//     }
//     let responses = []
//     if (config.signatureServer.length > 0) {
//         try {
//             let r = []
//             for (let i = 0; i < config.signatureServer.length; i++) {
//                 r.push(readStatus(i))
//             }
//             responses = await Promise.all(r)
//         } catch (e) {
//             console.log(e)
//         }
//     }
//     return res.json({ apiServer: myNodeResult.success, others: responses, index: index })
// })
// /**
//  * History of all bridge in all network
//  *
//  * @param limit limit records per page
//  * @param page page want to see
//  * @returns object history of request/claim bridge
//  */
// router.get('/history', [
//     query('limit').isInt({ min: 0, max: 200 }).optional().withMessage('limit should greater than 0 and less than 200'),
//     query('page').isNumeric({ no_symbols: true }).optional().withMessage('page must be number')
// ], async function (req, res, next) {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }
//     let limit = (req.query.limit) ? parseInt(req.query.limit) : 50
//     let page = req.query.page || 1
//     let skip = limit * (page - 1)
//     let total = await db.Transaction.countDocuments({})
//     let transactions = await db.Transaction.find({}).sort({ requestTime: -1 }).limit(limit).skip(skip).lean().exec()
//     for (const t of transactions) {
//         if (t.originToken === "0x1111111111111111111111111111111111111111") {
//             t.originDecimals = 18
//         } else {
//             let token = await tokenHelper.getToken(t.originToken, t.originChainId)
//             t.originDecimals = token.decimals
//         }
//     }
//     return res.json({
//         transactions: transactions,
//         page: page,
//         limit: limit,
//         total: total
//     })
// })
// /**
//  * Request to withdraw bridge request in destination chain
//  *
//  * @param requestHash request bridge transaction hash
//  * @param fromChainId request from network
//  * @param toChainId destination network
//  * @param index index of transaction
//  * @returns signature to claim token
//  */
// router.post('/request-withdraw', [
//     //check('signature').exists().withMessage('signature is require'),
//     check('requestHash').exists().withMessage('requestHash is require'),
//     check('fromChainId').exists().isNumeric({ no_symbols: true }).withMessage('fromChainId is incorrect'),
//     check('toChainId').exists().isNumeric({ no_symbols: true }).withMessage('toChainId is incorrect'),
//     check('index').exists().withMessage('index is require')
// ], async function (req, res, next) {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }
//     let requestHash = req.body.requestHash
//     let fromChainId = req.body.fromChainId
//     let toChainId = req.body.toChainId
//     let index = req.body.index
//     let transaction = {}
//     if (!config.checkTxOnChain) {
//         transaction = await db.Transaction.findOne({ requestHash: requestHash, fromChainId: fromChainId, toChainId: toChainId, index: index })
//     } else {
//         transaction = await eventHelper.getRequestEvent(fromChainId, requestHash, index)
//     }
//     if (!transaction) {
//         return res.status(400).json({ errors: "invalid transaction hash" })
//     }
//     if (fromChainId !== casperConfig.networkId) {
//         let web3 = await Web3Utils.getWeb3(fromChainId)
//         if (!transaction) {
//             return res.status(400).json({ errors: 'Transaction does not exist' })
//         }
//         if (transaction.claimed === true) {
//             return res.status(400).json({ errors: 'Transaction claimed' })
//         }
//         //re-verify whether tx still in the chain and confirmed (enough confirmation)
//         let onChainTx = await web3.eth.getTransaction(transaction.requestHash)
//         if (!onChainTx) {
//             return res.status(400).json({ errors: 'invalid transaction hash' })
//         }
//         let latestBlockNumber = await web3.eth.getBlockNumber()
//         let confirmations = config.blockchain[fromChainId].confirmations
//         if (latestBlockNumber - transaction.requestBlock < confirmations) {
//             return res.status(400).json({ errors: 'transaction not fully confirmed' })
//         }
//         let txBlock = await web3.eth.getBlock(transaction.requestBlock)
//         if (!txBlock || txBlock.number !== onChainTx.blockNumber) {
//             return res.status(400).json({ errors: 'transaction invalid, fork happened' })
//         }
//         //is it necessary? check whether tx included in the block
//         if (txBlock.transactions.length <= onChainTx.transactionIndex || txBlock.transactions[onChainTx.transactionIndex].toLowerCase() !== transaction.requestHash.toLowerCase()) {
//             return res.status(400).json({ errors: 'transaction not found, fork happened' })
//         }
//     } else {
//         //casper
//         try {
//             transaction = await db.Transaction.findOne({ requestHash: requestHash, fromChainId: fromChainId })
//             if (!transaction) {
//                 return res.json({ success: false })
//             }
//             let casperRPC = await CasperHelper.getCasperRPC(transaction.requestBlock)
//             let deployResult = await casperRPC.getDeployInfo(CasperHelper.toCasperDeployHash(transaction.requestHash))
//             let eventData = await CasperHelper.parseRequestFromCasper(deployResult)
//             if (eventData.toAddr.toLowerCase() !== transaction.account.toLowerCase()
//                 || eventData.originToken.toLowerCase() !== transaction.originToken.toLowerCase()
//                 || eventData.amount !== transaction.amount
//                 || eventData.fromChainId !== transaction.fromChainId
//                 || eventData.toChainId !== transaction.toChainId
//                 || eventData.originChainId !== transaction.originChainId
//                 || eventData.index !== transaction.index) {
//                 return res.status(400).json({ errors: 'conflict transaction data between local database and on-chain data ' + transaction.requestHash })
//             }
//         } catch (e) {
//             console.error(e)
//             return res.status(400).json({ errors: 'failed to get on-chain casper transction for ' + transaction.requestHash })
//         }
//     }
//     let otherSignature = []
//     if (config.signatureServer.length > 0) {
//         try {
//             let body = {
//                 requestHash: req.body.requestHash,
//                 fromChainId: req.body.fromChainId,
//                 toChainId: req.body.toChainId,
//                 index: req.body.index
//             }
//             let r = []
//             const requestSignatureFromOther = async function (i) {
//                 try {
//                     console.log("requesting signature from ", config.signatureServer[i])
//                     let ret = await axios.post(config.signatureServer[i] + '/request-withdraw', body, { timeout: 20 * 1000 })
//                     let recoveredAddress = Web3Utils.recoverSignerFromSignature(ret.data.msgHash, ret.data.r[0], ret.data.s[0], ret.data.v[0])
//                     console.log("signature data ok ", config.signatureServer[i], recoveredAddress)
//                     return ret
//                 } catch (e) {
//                     console.log("failed to get signature from ", config.signatureServer[i], e.toString())
//                     return { data: {} }
//                 }
//             }
//             for (let i = 0; i < config.signatureServer.length; i++) {
//                 r.push(requestSignatureFromOther(i))
//             }
//             const responses = await Promise.all(r)
//             for (let i = 0; i < config.signatureServer.length; i++) {
//                 otherSignature.push(responses[i].data)
//             }
//         } catch (e) {
//             console.log(e)
//         }
//     }
//     const nativeAddress = config.get('nativeAddress')
//     let name, decimals, symbol
//     if (transaction.originToken.toLowerCase() === nativeAddress.toLowerCase()) {
//         name = config.blockchain[transaction.originChainId].nativeName
//         symbol = config.blockchain[transaction.originChainId].nativeSymbol
//         decimals = 18
//     } else {
//         let web3Origin = await Web3Utils.getWeb3(transaction.originChainId)
//         let originTokenContract = await new web3Origin.eth.Contract(IERC20ABI, transaction.originToken)
//         name = await originTokenContract.methods.name().call()
//         decimals = await originTokenContract.methods.decimals().call()
//         symbol = await originTokenContract.methods.symbol().call()
//     }
//     if (transaction.toChainId !== transaction.originChainId) {
//         let nativeName = config.blockchain[transaction.toChainId].nativeName
//         name = "DTO Wrapped " + name + `(${nativeName})`
//         symbol = "d" + symbol
//     }
//     if (transaction.toChainId === casperConfig.networkId) {
//         return res.status(400).json({ errors: 'Dont manually claim on casper chain' })
//     }
//     let r = []
//     let s = []
//     let v = []
//     if (config.proxy) {
//         let msgHash = ""
//         //dont sign
//         if (otherSignature.length > 0) {
//             for (let i = 0; i < otherSignature.length; i++) {
//                 if (otherSignature[i].r) {
//                     msgHash = otherSignature[i].msgHash
//                     r.push(otherSignature[i].r[0])
//                     s.push(otherSignature[i].s[0])
//                     v.push(otherSignature[i].v[0])
//                 }
//             }
//         }
//         //reading required number of signature
//         let minApprovers = 0
//         let approverList = []
//         let retry = 10
//         console.log("reading minApprovers", minApprovers)
//         while(retry > 0) {
//             try {
//                 let bridgeContract = await Web3Utils.getBridgeContract(transaction.toChainId)
//                 minApprovers = await bridgeContract.methods.minApprovers().call()
//                 approverList = await bridgeContract.methods.getBridgeApprovers().call()
//                 minApprovers = parseInt(minApprovers)
//                 break
//             } catch(e) {
//                 console.log("error in reading approver", minApprovers)
//                 await GeneralHelper.sleep(5 * 1000)
//             }
//             retry--
//         }
//         approverList = approverList.map(e => e.toLowerCase())
//         //filtering only good signature
//         console.log("done reading minApprovers", minApprovers)
//         let goodR = []
//         let goodS = []
//         let goodV = []
//         for(var i = 0; i < r.length; i++) {
//             let recoveredAddress = Web3Utils.recoverSignerFromSignature(msgHash, r[i], s[i], v[i])
//             if (approverList.includes(recoveredAddress.toLowerCase())) {
//                 goodR.push(r[i])
//                 goodS.push(s[i])
//                 goodV.push(v[i])
//             }
//         }
//         r = goodR
//         s = goodS
//         v = goodV
//         if (r.length < minApprovers) {
//             console.warn('Validators data are not fully synced yet, please try again later')
//             return res.status(400).json({ errors: 'Validators data are not fully synced yet, please try again later' })
//         }
//         r = r.slice(0, minApprovers + 2)
//         s = s.slice(0, minApprovers + 2)
//         v = v.slice(0, minApprovers + 2)
//         return res.json({ r: r, s: s, v: v, msgHash: msgHash, name: name, symbol: symbol, decimals: decimals })
//     } else {
//         let txHashToSign = transaction.requestHash.includes("0x") ? transaction.requestHash : ("0x" + transaction.requestHash)
//         logger.info("txHashToSign %s", txHashToSign)
//         let sig = Web3Utils.signClaim(
//             transaction.originToken,
//             transaction.account,
//             transaction.amount,
//             [transaction.originChainId, transaction.fromChainId, transaction.toChainId, transaction.index],
//             txHashToSign,
//             name,
//             symbol,
//             decimals
//         )
//         let r = [sig.r]
//         let s = [sig.s]
//         let v = [sig.v]
//         return res.json({ r: r, s: s, v: v, msgHash: sig.msgHash, name: name, symbol: symbol, decimals: decimals })
//     }
// })
module.exports = router;
