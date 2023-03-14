require("dotenv").config();
const config = require('config')
var Web3 = require("web3");
const utils = require("ethereumjs-util")
const ecc = require("genjs-ecc");
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
var PrivateKeyProvider = require("truffle-privatekey-provider");
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto')
const RegistryABI = require("./contractABI/SampleRegistry.json")
const GeneratorABI = require("./contractABI/SampleGenerator.json")
const MessengerABI = require("./contractABI/SampleMessenger.json")
const Web3Utils = require("./helpers/web3")






// var privateKey = "62537136911bca3a7e2b....";



// // var secp256k1 = require('elliptic-curve').secp256k1
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
    // console.log("Account 1: ")
    let viewingPrivate1 = await randomBytes(32)
    const viewPri1 = Buffer.from(viewingPrivate1).toString("hex")
    // console.log("viewingPrivate1 : ", viewPri1)
    const viewpubKey = secp256k1.publicKeyCreate(viewingPrivate1, false)
    let pkString = Buffer.from(viewpubKey).toString("hex")

    // console.log(" viewPub1 :", pkString)



    let spendingPrivate1 = await randomBytes(32)
    const spendPri1 = Buffer.from(spendingPrivate1).toString("hex")
    // console.log("spendingPrivate1 : ", spendPri1)
    const pubKey1 = secp256k1.publicKeyCreate(spendingPrivate1, false)
    let pkString1 = Buffer.from(pubKey1).toString("hex")
    // console.log(" spendPub1 :", pkString1)




    // console.log("Account 2: ")

    let viewingPrivate2 = await randomBytes(32)
    const viewPri2 = Buffer.from(viewingPrivate2).toString("hex")
    // console.log("viewingPrivate2 : ", viewPri2)
    const pubKey2 = secp256k1.publicKeyCreate(viewingPrivate2, false)
    let pkString2 = Buffer.from(pubKey2).toString("hex")

    // console.log(" viewPub2 :", pkString2)



    let spendingPrivate2 = await randomBytes(32)
    const spendPri2 = Buffer.from(spendingPrivate2).toString("hex")
    // console.log("spendingPrivate2 : ", spendPri2)
    const pubKey3 = secp256k1.publicKeyCreate(spendingPrivate2, false)
    let pkString3 = Buffer.from(pubKey3).toString("hex")
    // console.log(" spendPub2 :", pkString3)

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
async function readStealthKeys(registrant, networkId) {

    let both = await Web3Utils.getWeb3AndRPC(networkId);
    let web3 = both.web3
    let contractGeneratorAddress = config.contracts[networkId].generatorAddress
    const contractGenerator = new web3.eth.Contract(GeneratorABI, contractGeneratorAddress);

    const result = await contractGenerator.methods.stealthKeys(registrant).call();
    console.log(result)
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
    console.log(result)
    return {
        stealthAddress: result[0],
        ephemeralPubKey: result[1],
        sharedSecret: result[2],
        viewTag: result[3]
    };
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
        console.log("khai", addressCallFunction)
        const result = await contractRegistry.methods
            .registerKeys(contractGeneratorAddress, _spendPub, _viewPub)
            .send({ from: addressCallFunction }, async function (err, data) {
                console.log('kkkkk', err, data)
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

    const result = await contractMessenger.methods.privateETHTransfer(to, ephemeralPubKey, stealthRecipientAndViewTag, metadata).send({ from: addressCallFunction });
    console.log(result)
}



async function main() {
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
    let resultRegistryKeys = await registerKeys(web3, mainAccount1, 97, resultGetKey.account1_spendPub, resultGetKey.account1_viewPub)
    console.log("acc1 registed")
    let resultRegistryKeys2 = await registerKeys(web32, mainAccount2, 97, resultGetKey.account2_spendPub, resultGetKey.account2_viewPub)
    console.log("acc2 registed")

    let generateStealthAddressAcc1 = await generateStealthAddress(web3, mainAccount2, 97, resultGetKey.account2_spendPri, mainAccount1)
    console.log(generateStealthAddressAcc1)

    let privateEthTransfer = await privateETHTransfer(web3, mainAccount1, 97, generateStealthAddressAcc1.stealthAddress, generateStealthAddressAcc1.ephemeralPubKey, generateStealthAddressAcc1.viewTag, '0x1111111111111111111111111111111111111111000000000000000000000001')
    console.log("tranfer")

}
main()



// function returnAllKeys(registrans, registransViewPubKey, registransSpendPubKey) {

// }