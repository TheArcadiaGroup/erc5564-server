import express from 'express'
const router = express.Router()
// const db = require('../models')
// import { connect } from "../models/index";
// import { TransactionModel } from "../models/transactions/transaction.model"
import Web3Utils from './helpers/web3'
// const { check, validationResult, query } = require('express-validator')
require('dotenv').config()
const config = require('config')
const eventHelper = require('../helpers/event')
// const IERC20ABI = require('../contracts/ERC20.json')
const axios = require('axios')
const logger = require('../helpers/logger')
const { validationResult } = require('express-validator')
import GeneratorABI from "./contractABI/SampleGenerator.json"
import BigNumber from 'bignumber.js'
import elipptic from 'elliptic';
var EC = elipptic.ec
var ec = new EC('secp256k1');
const BN = require('bn.js');
const secp256k1 = require('secp256k1')
const { keccak256 } = require("ethereumjs-util");
import { readFileSync, writeFileSync } from 'fs';
import db from "../db.json"
import UserSchema from './models/users/user.schema'

let gx = "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"

let gy = "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"



// const tokenHelper = require("../helpers/token");
// const GeneralHelper = require('../helpers/general')
async function readStealthKeys(registrant: any, networkId: any) {
    try {
        let both = await Web3Utils.getWeb3AndRPC(networkId);
        let web3 = both.web3
        let contractGeneratorAddress = config.contracts[networkId].generatorAddress
        const contractGenerator = new web3.eth.Contract(GeneratorABI, contractGeneratorAddress);
        const result = await contractGenerator.methods.stealthKeys(registrant).call();
        return result
        // return {
        //     spendingPubKeyX: result[0],
        //     spendingPubKeyY: result[1],
        //     viewingPubKeyX: result[2],
        //     viewingPubKeyY: result[3]
        // };


    } catch (e) {
        console.log("Error read stealthKeys function of Generator contract")
        console.log(e)
        return
    }

}
function convertToBN(hex: any) {
    let thisBN = new BN(hex, 16)
    return thisBN
}

function multiplyScalar(x: any, y: any, scalar: any) {
    // x = "0x" + x
    // y = "0x" + y
    let tempsKey = ec.keyFromPublic({ x, y }, "hex").getPublic()
    // console.log(tempsKey)
    let multiply = tempsKey.mul(scalar)
    return [multiply.getX().toString("hex"), multiply.getY().toString("hex")]; // Return the x and y coordinates as strings
}

function makePoint(x: any, y: any) {
    // x = "0x" + x
    // y = "0x" + y
    let tempsKey1 = ec.keyFromPublic({ x, y }, "hex").getPublic()
    return tempsKey1
}

function addPoints(a: any, b: any) {
    let sumPoint = a.add(b)
    return [sumPoint.getX().toString("hex"), sumPoint.getY().toString("hex")]; // Return the x and y coordinates as strings
}

function pubkeyToAddress(pub: any) {
    let hash = keccak256(pub);
    // console.log(hash)
    hash = hash.toString("hex")
    // console.log(hash)
    const wallet = `0x${hash.slice(24)}`; // Convert the last 20 bytes of hash to an Ethereum address
    return wallet;
}
async function getallstealthaddress(userAddress: any, networkId: any, useViewPrivateKey: any) {
    let allStealthKeys: string[] = []

    try {

        let result: any = await readStealthKeys(userAddress, networkId)
        let spendPubX = BigNumber(result[0]).toString(16)
        let spendPubY = BigNumber(result[1]).toString(16)
        let viewPubX = BigNumber(result[2]).toString(16)
        let viewPubY = BigNumber(result[3]).toString(16)


        // get allTransactions from file db.json

        Object.entries(db).forEach((element) => {
            let s = element[1]
            try {
                let ephemeralPub = s.ephemeralPubKey
                let _ephemeralPub
                if (ephemeralPub.length == 132) {

                    _ephemeralPub = ephemeralPub.slice(4)
                } else if (ephemeralPub.length == 130) {
                    _ephemeralPub = ephemeralPub.slice(2)
                } else if (ephemeralPub.length == 128) {
                    _ephemeralPub = ephemeralPub
                } else {
                    console.log("Error ephemeral public key format ")
                    return
                }
                let xHex = _ephemeralPub.slice(0, 64)
                let yHex = _ephemeralPub.slice(64)
                let getSharedSecretXY = multiplyScalar(xHex, yHex, convertToBN(useViewPrivateKey));
                let sharedSecret = Buffer.from(getSharedSecretXY[0] + getSharedSecretXY[1], "hex") //Buffer.concat([Buffer.from(result1[0], "hex"), Buffer.from(result1[1], "hex")])

                let sharedSecretHash = keccak256(sharedSecret).toString("hex")
                let getSharedSecretPointXY = multiplyScalar(gx, gy, convertToBN(sharedSecretHash))
                let a1 = getSharedSecretPointXY[0]
                let b1 = getSharedSecretPointXY[1]
                let sharedSecretPoint = Buffer.from(a1 + b1, "hex") //Buffer.concat([Buffer.from(a1, "hex"), (Buffer.from(b1, "hex"))])
                let sharedSecretPointHex = sharedSecretPoint.toString("hex")


                // this part is add 2 points   


                let aA = sharedSecretPointHex.slice(0, 64)
                let bB = sharedSecretPointHex.slice(64)

                let pointA = makePoint(aA, bB)
                let pointB = makePoint(spendPubX, spendPubY)
                let pointC = addPoints(pointA, pointB)

                let stealthPubKey = Buffer.from(pointC[0] + pointC[1], "hex")//Buffer.concat([Buffer.from(pointC[0], "hex"), (Buffer.from(pointC[1], "hex"))])


                let stealthAddress = pubkeyToAddress(stealthPubKey)

                if (stealthAddress == s.stealthRecipient) {
                    console.log("Find your new Stealth Address ", stealthAddress)
                    allStealthKeys.push(stealthAddress)
                }
            } catch (e) {

                console.log(e)
            }
        })
        console.log("All stealth key you have is : ", allStealthKeys)

    } catch (e) {
        console.log(e)
    }


}

async function checkstealthaddress(userAddress: any, networkId: any, useViewPrivateKey: any, stealthAddress: any) {
    // let allStealthKeys: string[] = []

    try {

        let result: any = await readStealthKeys(userAddress, networkId)
        let spendPubX = BigNumber(result[0]).toString(16)
        let spendPubY = BigNumber(result[1]).toString(16)
        let viewPubX = BigNumber(result[2]).toString(16)
        let viewPubY = BigNumber(result[3]).toString(16)


        // get allTransactions from file db.json

        Object.entries(db).forEach((element) => {
            let s = element[1]
            if (s.stealthRecipient == stealthAddress) {
                try {
                    let ephemeralPub = s.ephemeralPubKey
                    let _ephemeralPub
                    if (ephemeralPub.length == 132) {

                        _ephemeralPub = ephemeralPub.slice(4)
                    } else if (ephemeralPub.length == 130) {
                        _ephemeralPub = ephemeralPub.slice(2)
                    } else if (ephemeralPub.length == 128) {
                        _ephemeralPub = ephemeralPub
                    } else {
                        console.log("Error ephemeral public key format ")
                        return
                    }
                    let xHex = _ephemeralPub.slice(0, 64)
                    let yHex = _ephemeralPub.slice(64)
                    let getSharedSecretXY = multiplyScalar(xHex, yHex, convertToBN(useViewPrivateKey));
                    let sharedSecret = Buffer.from(getSharedSecretXY[0] + getSharedSecretXY[1], "hex") //Buffer.concat([Buffer.from(result1[0], "hex"), Buffer.from(result1[1], "hex")])

                    let sharedSecretHash = keccak256(sharedSecret).toString("hex")
                    let getSharedSecretPointXY = multiplyScalar(gx, gy, convertToBN(sharedSecretHash))
                    let a1 = getSharedSecretPointXY[0]
                    let b1 = getSharedSecretPointXY[1]
                    let sharedSecretPoint = Buffer.from(a1 + b1, "hex") //Buffer.concat([Buffer.from(a1, "hex"), (Buffer.from(b1, "hex"))])
                    let sharedSecretPointHex = sharedSecretPoint.toString("hex")


                    // this part is add 2 points   


                    let aA = sharedSecretPointHex.slice(0, 64)
                    let bB = sharedSecretPointHex.slice(64)

                    let pointA = makePoint(aA, bB)
                    let pointB = makePoint(spendPubX, spendPubY)
                    let pointC = addPoints(pointA, pointB)

                    let stealthPubKey = Buffer.from(pointC[0] + pointC[1], "hex")//Buffer.concat([Buffer.from(pointC[0], "hex"), (Buffer.from(pointC[1], "hex"))])


                    let thisStealthAddress = pubkeyToAddress(stealthPubKey)

                    if (thisStealthAddress == stealthAddress) {
                        console.log("this stealth address is belong to you ", stealthAddress)
                        // allStealthKeys.push(stealthAddress)
                    }
                } catch (e) {

                    console.log(e)
                }
            }

        })
        // console.log("All stealth key you have is : ", allStealthKeys)

    } catch (e) {
        console.log(e)
    }


}
function main() {
    let userAddress = "0x4385F9532855d149068A32e42b07687264a94EEA"
    let chainId = "97"
    let useViewPrivateKey = "aa"
    let stealthAddress = ""
    getallstealthaddress(userAddress, chainId, useViewPrivateKey)
    if (stealthAddress != "") {
        checkstealthaddress(userAddress, chainId, useViewPrivateKey, stealthAddress)
    }

}
main()


