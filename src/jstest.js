require("dotenv").config();
const config = require('config')
var Web3 = require("web3");
const utils = require("ethereumjs-util")
// const keccak256 = require("keccak256")
// const ECC = require("ecc");
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
var PrivateKeyProvider = require("truffle-privatekey-provider");
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto')
const RegistryABI = require("./contractABI/SampleRegistry.json")
const GeneratorABI = require("./contractABI/SampleGenerator.json")
const MessengerABI = require("./contractABI/SampleMessenger.json")
const Web3Utils = require("./helpers/web3");
// const db = require("./models");
const { keccak256 } = require("ethereumjs-util");
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const BN = require('bn.js');
const { default: BigNumber } = require("bignumber.js");
let gx = "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296"

let gy = "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5"

async function getRandomHex() {
    let hex = await Web3.utils.randomHex(32)
    return hex;
}


function multiplyScalar(x, y, scalar) {
    // x = "0x" + x
    // y = "0x" + y
    let tempsKey = ec.keyFromPublic({ x, y }, "hex").getPublic()
    // console.log(tempsKey)
    let multiply = tempsKey.mul(scalar)
    return [multiply.getX().toString("hex"), multiply.getY().toString("hex")]; // Return the x and y coordinates as strings
}

function makePoint(x, y) {
    // x = "0x" + x
    // y = "0x" + y
    let tempsKey1 = ec.keyFromPublic({ x, y }, "hex").getPublic()
    return tempsKey1
}

function addPoints(a, b) {
    let sumPoint = a.add(b)
    return [sumPoint.getX().toString("hex"), sumPoint.getY().toString("hex")]; // Return the x and y coordinates as strings
}

function pubkeyToAddress_fix(pub) {
    let hash = keccak256(pub);
    // console.log(hash)
    hash = hash.toString("hex")
    console.log(hash)
    const wallet = `0x${hash.slice(24)}`; // Convert the last 20 bytes of hash to an Ethereum address
    return wallet;
}




async function getKey() {
    // var web3 = new Web3('http://localhost:8545'); // your geth
    console.log("Account 1: ")
    let viewingPrivate1 = await randomBytes(32)
    const viewPri1 = Buffer.from(viewingPrivate1).toString("hex")
    console.log("viewingPrivate1 : ", viewPri1)
    const viewpubKey = secp256k1.publicKeyCreate(viewingPrivate1, false)
    let pkString = Buffer.from(viewpubKey).toString("hex").slice(2)

    console.log(" viewPub1 :", pkString)



    let spendingPrivate1 = await randomBytes(32)
    const spendPri1 = Buffer.from(spendingPrivate1).toString("hex")
    console.log("spendingPrivate1 : ", spendPri1)
    const pubKey1 = secp256k1.publicKeyCreate(spendingPrivate1, false)
    let pkString1 = Buffer.from(pubKey1).toString("hex").slice(2)
    console.log(" spendPub1 :", pkString1)




    console.log("Account 2: ")

    let viewingPrivate2 = await randomBytes(32)
    const viewPri2 = Buffer.from(viewingPrivate2).toString("hex")
    console.log("viewingPrivate2 : ", viewPri2)
    const pubKey2 = secp256k1.publicKeyCreate(viewingPrivate2, false)
    let pkString2 = Buffer.from(pubKey2).toString("hex").slice(2)

    console.log(" viewPub2 :", pkString2)



    let spendingPrivate2 = await randomBytes(32)
    const spendPri2 = Buffer.from(spendingPrivate2).toString("hex")
    console.log("spendingPrivate2 : ", spendPri2)
    const pubKey3 = secp256k1.publicKeyCreate(spendingPrivate2, false)
    let pkString3 = Buffer.from(pubKey3).toString("hex").slice(2)
    console.log(" spendPub2 :", pkString3)

    return {
        account1_viewPri: viewPri1,
        account1_viewPub: pkString,
        account1_spendPri: spendPri1,
        account1_spendPub: pkString1,
        account2_viewPri: viewPri2,
        account2_viewPub: pkString2,
        account2_spendPri: spendPri2,
        account2_spendPub: pkString3,
    }



}
async function getRandomEphemralKey() {
    let ephemeralPri = await randomBytes(32)
    const ephemeralPriHex = Buffer.from(ephemeralPri).toString("hex")
    console.log("ephemeralPriHex : ", ephemeralPriHex)
    const ephemeralPub = secp256k1.publicKeyCreate(ephemeralPri, false)
    let ephemeralPubHex = Buffer.from(ephemeralPub).toString("hex").slice(2)

    console.log(" ephemeralPubHex :", ephemeralPubHex)

    return {
        ephemeralPri: ephemeralPriHex,
        ephemeralPub: ephemeralPubHex,
    }



}

function getRandomEphemralKey_2(ephemeralPriHex) {
    console.log(ephemeralPriHex)
    let kk = multiplyScalar(gx, gy, convertToBN(ephemeralPriHex))
    console.log(convertToBN(ephemeralPriHex).toString("hex"))

    console.log(" ephemeralPubHex :", kk)

    // return {
    //     ephemeralPri: ephemeralPriHex,
    //     ephemeralPub: ephemeralPubHex,
    // }



}
async function readStealthKeys(registrant, networkId) {

    let both = await Web3Utils.getWeb3AndRPC(networkId);
    let web3 = both.web3
    let contractGeneratorAddress = config.contracts[networkId].generatorAddress
    const contractGenerator = new web3.eth.Contract(GeneratorABI, contractGeneratorAddress);
    const result = await contractGenerator.methods.stealthKeys(registrant).call();
    return {
        spendingPubKeyX: result[0],
        spendingPubKeyY: result[1],
        viewingPubKeyX: result[2],
        viewingPubKeyY: result[3]
    };
}

async function generateStealthAddress(web3, registrant, networkId, ephemeralPrivKey, addressCallFunction) {

    let both = await Web3Utils.getWeb3AndRPC(networkId);
    // let web3 = both.web3
    let contractGeneratorAddress = config.contracts[networkId].generatorAddress
    const contractGenerator = new web3.eth.Contract(GeneratorABI, contractGeneratorAddress);
    let _ephemeralPrivKey = "0x" + ephemeralPrivKey

    const result = await contractGenerator.methods.generateStealthAddress(registrant, _ephemeralPrivKey).call({ from: addressCallFunction });
    // console.log(result)
    return {
        stealthAddress: result[0],
        ephemeralPubKey: result[1],
        sharedSecret: result[2],
        viewTag: result[3]
    };
}
function convertHexToBigInt(hex) {
    var base = 10;
    var bn = BigInt(hex);

    return bn.toString(base);

}

function convertToBN(hex) {
    let thisBN = new BN(hex, 16)
    return thisBN
}
async function registerKeys(web3, addressCallFunction, networkId, spendingPubKey, viewingPubKey) {
    try {
        let both = await Web3Utils.getWeb3AndRPC(networkId);
        // let web3 = both.web3
        let contractGeneratorAddress = config.contracts[networkId].generatorAddress

        let contractRegistyAddress = config.contracts[networkId].registryAddress

        const contractRegistry = new web3.eth.Contract(RegistryABI, contractRegistyAddress)
        const _spendPub = "0x" + spendingPubKey
        const _viewPub = "0x" + viewingPubKey
        const result = await contractRegistry.methods
            .registerKeys(contractGeneratorAddress, _spendPub, _viewPub)
            .send({ from: addressCallFunction }, async function (err, data) {
            });
        console.log("done")
        // console.log(result)

    } catch (e) {
        console.log(e)
    }

}

async function privateETHTransfer(web3, addressCallFunction, networkId, to, ephemeralPubKey, stealthRecipientAndViewTag, metadata) {

    let contractMessengerAddress = config.contracts[networkId].announceAddress
    const contractMessenger = new web3.eth.Contract(MessengerABI, contractMessengerAddress)
    let _ephemeralPubKey = '0x' + ephemeralPubKey

    const result = await contractMessenger.methods.privateETHTransfer(to, _ephemeralPubKey, stealthRecipientAndViewTag, metadata).send({ from: addressCallFunction });
    // console.log(result)
}
async function getBackStealthKey(userAddress, networkId, useViewPrivateKey) {

    // This part is OK

    /* 
     Get back 4 pubkeys
            spendingPubKeyX := mload(add(spendingPubKey, 0x20))
            spendingPubKeyY := mload(add(spendingPubKey, 0x40))
            viewingPubKeyX := mload(add(viewingPubKey, 0x20))
            viewingPubKeyY := mload(add(viewingPubKey, 0x40))
 
    */
    let result = await readStealthKeys(userAddress, networkId)
    let spendPubX = BigNumber(result.spendingPubKeyX).toString(16)
    let spendPubY = BigNumber(result.spendingPubKeyY).toString(16)
    let viewPubX = BigNumber(result.viewingPubKeyX).toString(16)
    let viewPubY = BigNumber(result.viewingPubKeyY).toString(16)

    console.log("4 keys ", spendPubX, spendPubY, viewPubX, viewPubY)



    // get SharedSecretPoint



    // let allTransactions = await db.Transaction.find()
    // await Promise.all(allTransactions.map(async (s) => {
    // let ephemeralPub = s.ephemeralPubKey
    let ephemeralPub = "0xb3a7d0822cce52fd771411e5e3b0e3db3d1124b9f80c8da0f524e72c5b55bf9d06c75a72391dd5a37a307f59c5c9f5129de13d932d050cad76cb40f905c75a07"
    let _ephemeralPub
    if (ephemeralPub.length == 132) {

        _ephemeralPub = ephemeralPub.slice(4)
    } else if (ephemeralPub.length = 130) {
        _ephemeralPub = ephemeralPub.slice(2)
    } else if (ephemeralPub.length == 128) {
        _ephemeralPub = ephemeralPub
    } else {
        console.log("Error ephemeral public key format ")
        return
    }
    let xHex = _ephemeralPub.slice(0, 64)
    let yHex = _ephemeralPub.slice(64)
    console.log("ephemeral pub ", xHex, yHex)
    let getSharedSecretXY = multiplyScalar(xHex, yHex, convertToBN(useViewPrivateKey));
    let sharedSecret = Buffer.from(getSharedSecretXY[0] + getSharedSecretXY[1], "hex") //Buffer.concat([Buffer.from(result1[0], "hex"), Buffer.from(result1[1], "hex")])

    let sharedSecretHash = keccak256(sharedSecret).toString("hex")
    console.log("sharedSecretHash: ", sharedSecretHash)
    let getSharedSecretPointXY = multiplyScalar(gx, gy, convertToBN(sharedSecretHash))
    let a1 = getSharedSecretPointXY[0]
    let b1 = getSharedSecretPointXY[1]
    let sharedSecretPoint = Buffer.from(a1 + b1, "hex") //Buffer.concat([Buffer.from(a1, "hex"), (Buffer.from(b1, "hex"))])
    let sharedSecretPointHex = sharedSecretPoint.toString("hex")
    console.log("sharedSecretPointHex : ", sharedSecretPointHex)



    // this part is add 2 points   


    let aA = sharedSecretPointHex.slice(0, 64)
    let bB = sharedSecretPointHex.slice(64)
    // console.log("a2 b2 ", a2, b2)

    console.log("hihi", spendPubX, spendPubY, aA, bB)
    let pointA = makePoint(aA, bB)
    let pointB = makePoint(spendPubX, spendPubY)
    let pointC = addPoints(pointA, pointB)
    // let pointA = ec.keyFromPublic({aA, bB}, "hex").getPublic()
    // let pointB = ec.keyFromPublic({spendPubX, spendPubY}, "hex").getPublic()
    // let result4 = addPoints(spendPubX, spendPubY, aA, bB)

    // let result4 = addPoint(spendPubX, spendPubY, a2, b2, xHex, yHex)

    let stealthPubKey = Buffer.from(pointC[0] + pointC[1], "hex")//Buffer.concat([Buffer.from(pointC[0], "hex"), (Buffer.from(pointC[1], "hex"))])

    let stealthAddress = pubkeyToAddress_fix(stealthPubKey)
    // let stealthAddress = crypto.
    console.log(stealthAddress)


    // }))





}

async function runTestTransactions() {
    // let acc1 = '0xDAf16065A7581f867294860735a3b53EB2dA00A6'
    // let acc2 = '0x4385F9532855d149068A32e42b07687264a94EEA'
    // get rpc
    let both = await Web3Utils.getWeb3AndRPC(97);
    let rpc = both.rpc

    // console.log("both: ", both)
    const privateKey1 = process.env.PRIVATE_KEY1;
    console.log("privateKey1: ", privateKey1)
    const web3 = new Web3(new PrivateKeyProvider(privateKey1, rpc));
    const accounts1 = await web3.eth.getCoinbase();
    console.log("accounts1: ", accounts1)
    const mainAccount1 = accounts1
    const privateKey2 = process.env.PRIVATE_KEY2;
    const web32 = new Web3(new PrivateKeyProvider(privateKey2, rpc));
    const accounts2 = await web32.eth.getAccounts();
    const mainAccount2 = accounts2[0];
    // getkey
    let resultGetKey = await getKey();
    // console.log(resultGetKey)
    // registry for account
    console.log("mainAccount1 : ", mainAccount1)
    let resultRegistryKeys = await registerKeys(web3, mainAccount1, 97, resultGetKey.account1_spendPub, resultGetKey.account1_viewPub)
    console.log("acc1 registed")
    console.log("mainAccount2 : ", mainAccount2)
    let resultRegistryKeys2 = await registerKeys(web32, mainAccount2, 97, resultGetKey.account2_spendPub, resultGetKey.account2_viewPub)
    console.log("acc2 registed")

    try {

        for (var i = 0; i < 1; i++) {

            let randomEpphemeral = await getRandomEphemralKey()

            let generateStealthAddressAcc1 = await generateStealthAddress(web3, mainAccount2, 97, randomEpphemeral.ephemeralPri, mainAccount1)
            console.log("generateStealthAddressAcc1 ", generateStealthAddressAcc1)

            let privateEthTransfer = await privateETHTransfer(web3, mainAccount1, 97, generateStealthAddressAcc1.stealthAddress, randomEpphemeral.ephemeralPub, generateStealthAddressAcc1.viewTag, '0x1111111111111111111111111111111111111111000000000000000000000001')
            console.log("tranfer %s ", i)
        }
    } catch (e) {
        console.log("Error: ", e)
    }

}
async function main() {
    let viewingPrivate1ToHex = "59f3768475dd1be73d8994c3eecfadf88e46911e06005257c266a1ff328bcee5"

    await getBackStealthKey("0x4385F9532855d149068A32e42b07687264a94EEA", 97, viewingPrivate1ToHex)
}
main()