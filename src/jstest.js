var Web3 = require("web3");
const utils = require("ethereumjs-util")
const ecc = require("genjs-ecc");
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
var PrivateKeyProvider = require("truffle-privatekey-provider");
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto')


// var privateKey = "62537136911bca3a7e2b....";



// // var secp256k1 = require('elliptic-curve').secp256k1
// import Web3Utils from "./helpers/web3"
// import ecc from 'eosjs-ecc'



// var web3 = new Web3('http://localhost:8545'); // your geth
// var account = web3.eth.accounts.create();
// console.log(account)
// console.log(account.privateKey)
// console.log(account.address)
// let recover =  web3.eth.accounts.privateKeyToAccount(account.privateKey);
// let publics =  web3.eth.accounts.privateKeyToPublicKey(account.privateKey);
// console.log(recover, publics)
// Uint8Array.from(Buffer.from(wrapped_token_adr, 'hex'))

async function getRandomHex() {
    let hex = await Web3.utils.randomHex(32)
    return hex;
}



async function getKey() {
    // var web3 = new Web3('http://localhost:8545'); // your geth
    console.log("Account 1: ")
    let viewingPrivate1 = await randomBytes(32)
    const viewPri1 = Buffer.from(viewingPrivate1).toString("hex")
    console.log("viewingPrivate1 : ", viewPri1)
    const pubKey = secp256k1.publicKeyCreate(viewingPrivate1, false)
    let pkString = Buffer.from(pubKey).toString("hex")

    console.log(" viewPub1 :", pkString)



    let spendingPrivate1 = await randomBytes(32)
    const spendPri1 = Buffer.from(spendingPrivate1).toString("hex")
    console.log("spendingPrivate1 : ", spendPri1)
    const pubKey1 = secp256k1.publicKeyCreate(spendingPrivate1, false)
    let pkString1 = Buffer.from(pubKey1).toString("hex")
    console.log(" spendPub1 :", pkString1)




    console.log("Account 2: ")

    let viewingPrivate2 = await randomBytes(32)
    const viewPri2 = Buffer.from(viewingPrivate2).toString("hex")
    console.log("viewingPrivate2 : ", viewPri2)
    const pubKey2 = secp256k1.publicKeyCreate(viewingPrivate2, false)
    let pkString2 = Buffer.from(pubKey2).toString("hex")

    console.log(" viewPub2 :", pkString2)



    let spendingPrivate2 = await randomBytes(32)
    const spendPri2 = Buffer.from(spendingPrivate2).toString("hex")
    console.log("spendingPrivate2 : ", spendPri2)
    const pubKey3 = secp256k1.publicKeyCreate(spendingPrivate2, false)
    let pkString3 = Buffer.from(pubKey3).toString("hex")
    console.log(" spendPub2 :", pkString3)



}

getKey()



// function returnAllKeys(registrans, registransViewPubKey, registransSpendPubKey) {

// }