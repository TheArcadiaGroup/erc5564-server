const events = require("events");
const BigNumber = require("bignumber.js");
const config = require("config");

import logger from "./helpers/logger"
import Web3Utils from "./helpers/web3"
// const tokenHelper = require("./helpers/token");
import RegistryBridgeABI from "./contractABI/SampleRegistry.json"
import GeneratorABI from "./contractABI/SampleGenerator.json"
import MessengerABI from "./contractABI/SampleMessenger.json"
import { connect } from "./models/index";
import { SettingModel } from "./models/settings/setting.model"
import { UserModel } from "./models/users/user.model"
import { TransactionModel } from "./models/transactions/transaction.model"

import * as Account from "web3-eth-accounts"
import { timeStamp } from "console";
// const CasperHelper = require("./helpers/casper");
// const CasperConfig = CasperHelper.getConfigInfo();
BigNumber.config({ EXPONENTIAL_AT: [-100, 100] });
const baseUnit = 10 ** 18;

// fix warning max listener
events.EventEmitter.defaultMaxListeners = 1000;
process.setMaxListeners(1000);
let sleep = (time: any) => new Promise((resolve) => setTimeout(resolve, time));

connect();
console.log("connect sc")
console.log("RamdomHex")
async function a() {
  let hexx = await Web3Utils.getRandomHex()
  console.log("Hex: ", hexx)
  // let web3 = await Web3Utils.getWeb3(97);
  // // console.log("web3: ", web3)
  // let account = await Web3Utils.createAccount(97, "abc")
  // console.log("account: ", account)
}

/**
 * update last block process in db.
 *
 * @param networkId network id (or chain id) of EVM a network
 * @param lastBlock last block processed
 */
async function updateBlock(networkId: any, lastBlock: any) {
  if (lastBlock) {
    console.log("updateBlock: ", lastBlock)
    let setting = await SettingModel.findOne({ networkId: networkId });
    if (!setting) {
      await SettingModel.updateOne(
        { networkId: networkId },
        { $set: { lastBlockRequest: lastBlock } },
        { upsert: true, new: true }
      );

      console.log("SAVE TO DB SETTING", lastBlock)
    }
    else {
      if (lastBlock > setting.lastBlockRequest) {
        setting.lastBlockRequest = lastBlock
        await setting.save()
      }
    }
    // }
  }
}

/**
 * store request bridge event info to database
 *
 * @param event Object of event
 * @param networkId network id (or chain id) of EVM a network
 */
async function processPrivateTransferInfoEvent(
  event: any,
  networkId: any) {
  logger.info("New event at block %s", event.blockNumber);
  console.log("event: ", event)

  let originChainId = event.returnValues._originChainId;
  let tokenAddress = event.returnValues._token.toLowerCase();
  // let token = await tokenHelper.getToken(tokenAddress, originChainId);

  let amount = event.returnValues._amount;

  let web3 = await Web3Utils.getWeb3(networkId);
  console.log("web3: ", web3)
  let block = await web3.eth.getBlock(event.blockNumber);
  console.log("blocknumber: ", block)

  // event RequestBridge(address indexed _token, bytes indexed _addr, uint256 _amount, uint256 _originChainId, uint256 _fromChainId, uint256 _toChainId, uint256 _index);
  let toAddrBytes = event.returnValues._toAddr;
  let decoded;
  try {
    decoded = web3.eth.abi.decodeParameters(
      [{ type: "string", name: "decodedAddress" }],
      toAddrBytes
    );
  } catch (e) {
    logger.error("cannot decode recipient address");
    console.log(e)
    return;
  }
  let decodedAddress = decoded.decodedAddress;
  // let casperChainId = CasperConfig.networkId;
  // if (parseInt(event.returnValues._toChainId) === casperChainId) {
  //   logger.info("bridging to casper network %s", decodedAddress);
  //   if (decodedAddress.length === 64) {
  //     decodedAddress = "account-hash-" + decodedAddress
  //   }
  // }

  //reading transaction creator
  let transactionHash = event.transactionHash
  let onChainTx = await web3.eth.getTransaction(transactionHash)
  console.log("onchaintx: ", onChainTx)
  if (!onChainTx) return;
  let txCreator = onChainTx.from.toLowerCase()
  // await db.Transaction.updateOne(
  //   {
  //     index: event.returnValues._index,
  //     fromChainId: event.returnValues._fromChainId,
  //     toChainId: event.returnValues._toChainId,
  //   },
  //   {
  //     $set: {
  //       requestHash: event.transactionHash,
  //       requestBlock: event.blockNumber,
  //       account: decodedAddress.toLowerCase(),
  //       txCreator: txCreator,
  //       originToken: token.hash,
  //       originSymbol: token.symbol,
  //       fromChainId: event.returnValues._fromChainId,
  //       originChainId: event.returnValues._originChainId,
  //       toChainId: event.returnValues._toChainId,
  //       amount: amount,
  //       index: event.returnValues._index,
  //       requestTime: block.timestamp,
  //     },
  //   },
  //   { upsert: true, new: true }
  // );
}

async function processRegistryEvent(event: any, networkId: any) {

  logger.info("New event at block %s", event.blockNumber);
  console.log("EVENT processRegistryEvent : ", event.returnValues.registrant)
  let registrant = event.returnValues.registrant
  let generator = event.returnValues.generator
  let spendingPubKey = event.returnValues.spendingPubKey
  let viewingPubKey = event.returnValues.viewingPubKey

  // save to DB

  // let user = await UserModel.findOne({ registrant: registrant });

  await UserModel.updateOne(
    { registrant: registrant },
    {
      $set: {
        generator: generator,
        spendingPubKey: spendingPubKey,
        viewingPubKey: viewingPubKey,
      }
    },
    { upsert: true, new: true }
  );

  console.log("SAVE TO DB SETTING", registrant)






  // let originChainId = event.returnValues._originChainId;
  // let tokenAddress = event.returnValues._token.toLowerCase();
  // // let token = await tokenHelper.getToken(tokenAddress, originChainId);

  // let amount = event.returnValues._amount;

  // let web3 = await Web3Utils.getWeb3(networkId);
  // console.log("web3: ", web3)
  // let block = await web3.eth.getBlock(event.blockNumber);
  // console.log("blocknumber: ", block)

  // // event RequestBridge(address indexed _token, bytes indexed _addr, uint256 _amount, uint256 _originChainId, uint256 _fromChainId, uint256 _toChainId, uint256 _index);
  // let toAddrBytes = event.returnValues._toAddr;
  // let decoded;
  // try {
  //   decoded = web3.eth.abi.decodeParameters(
  //     [{ type: "string", name: "decodedAddress" }],
  //     toAddrBytes
  //   );
  // } catch (e) {
  //   logger.error("cannot decode recipient address");
  //   console.log(e)
  //   return;
  // }
  // let decodedAddress = decoded.decodedAddress;
  // // let casperChainId = CasperConfig.networkId;
  // // if (parseInt(event.returnValues._toChainId) === casperChainId) {
  // //   logger.info("bridging to casper network %s", decodedAddress);
  // //   if (decodedAddress.length === 64) {
  // //     decodedAddress = "account-hash-" + decodedAddress
  // //   }
  // // }

  // //reading transaction creator
  // let transactionHash = event.transactionHash
  // let onChainTx = await web3.eth.getTransaction(transactionHash)
  // console.log("onchaintx: ", onChainTx)
  // if (!onChainTx) return;
  // let txCreator = onChainTx.from.toLowerCase()
  // // await db.Transaction.updateOne(
  // //   {
  // //     index: event.returnValues._index,
  // //     fromChainId: event.returnValues._fromChainId,
  // //     toChainId: event.returnValues._toChainId,
  // //   },
  // //   {
  // //     $set: {
  // //       requestHash: event.transactionHash,
  // //       requestBlock: event.blockNumber,
  // //       account: decodedAddress.toLowerCase(),
  // //       txCreator: txCreator,
  // //       originToken: token.hash,
  // //       originSymbol: token.symbol,
  // //       fromChainId: event.returnValues._fromChainId,
  // //       originChainId: event.returnValues._originChainId,
  // //       toChainId: event.returnValues._toChainId,
  // //       amount: amount,
  // //       index: event.returnValues._index,
  // //       requestTime: block.timestamp,
  // //     },
  // //   },
  // //   { upsert: true, new: true }
  // // );
}
async function processAnnouncementEvent(event: any, networkId: any) {

  logger.info("New event at block %s", event.blockNumber);
  console.log("EVENT  : ", event)

  console.log(" event.returnValues : ", event.returnValues)
  let ephemeralPubKey = event.returnValues.ephemeralPubKey // spendPubkey of sender
  let stealthRecipientAndViewTag = event.returnValues.stealthRecipientAndViewTag // 20 byte stealthAddress and 12 byte of viewtag
  let metadata = event.returnValues.metadata // 20 bytes token address and 12 bytes amount
  console.log("stealthRecipientAndViewTag: ", stealthRecipientAndViewTag)
  let stealthRecipient = stealthRecipientAndViewTag.toLowerCase().slice(0, 42)
  let viewTag = stealthRecipientAndViewTag.toLowerCase().slice(42, 66)
  logger.info("StealthAddress: %s %s", stealthRecipient, viewTag)
  let hash = event.transactionHash
  let web3 = await Web3Utils.getWeb3(networkId);
  let block = await web3.eth.getBlock(event.blockNumber);
  let timestamps = block.timestamp


  // save to DB

  // let transaction = await TransactionModel.findOne({ registrant: registrant });

  await TransactionModel.updateOne(
    { hash: hash,
      timestamps : timestamps},
    {
      $set: {
        ephemeralPubKey: ephemeralPubKey,
        stealthRecipientAndViewTag: stealthRecipientAndViewTag,
        metadata: metadata,
        stealthRecipient: stealthRecipient,
        viewTag: viewTag,
      }
    },
    { upsert: true, new: true }
  );

  console.log("SAVE TO DB Transaction", hash)






  // let originChainId = event.returnValues._originChainId;
  // let tokenAddress = event.returnValues._token.toLowerCase();
  // // let token = await tokenHelper.getToken(tokenAddress, originChainId);

  // let amount = event.returnValues._amount;

  // let web3 = await Web3Utils.getWeb3(networkId);
  // console.log("web3: ", web3)
  // let block = await web3.eth.getBlock(event.blockNumber);
  // console.log("blocknumber: ", block)

  // // event RequestBridge(address indexed _token, bytes indexed _addr, uint256 _amount, uint256 _originChainId, uint256 _fromChainId, uint256 _toChainId, uint256 _index);
  // let toAddrBytes = event.returnValues._toAddr;
  // let decoded;
  // try {
  //   decoded = web3.eth.abi.decodeParameters(
  //     [{ type: "string", name: "decodedAddress" }],
  //     toAddrBytes
  //   );
  // } catch (e) {
  //   logger.error("cannot decode recipient address");
  //   console.log(e)
  //   return;
  // }
  // let decodedAddress = decoded.decodedAddress;
  // // let casperChainId = CasperConfig.networkId;
  // // if (parseInt(event.returnValues._toChainId) === casperChainId) {
  // //   logger.info("bridging to casper network %s", decodedAddress);
  // //   if (decodedAddress.length === 64) {
  // //     decodedAddress = "account-hash-" + decodedAddress
  // //   }
  // // }

  // //reading transaction creator
  // let transactionHash = event.transactionHash
  // let onChainTx = await web3.eth.getTransaction(transactionHash)
  // console.log("onchaintx: ", onChainTx)
  // if (!onChainTx) return;
  // let txCreator = onChainTx.from.toLowerCase()
  // // await db.Transaction.updateOne(
  // //   {
  // //     index: event.returnValues._index,
  // //     fromChainId: event.returnValues._fromChainId,
  // //     toChainId: event.returnValues._toChainId,
  // //   },
  // //   {
  // //     $set: {
  // //       requestHash: event.transactionHash,
  // //       requestBlock: event.blockNumber,
  // //       account: decodedAddress.toLowerCase(),
  // //       txCreator: txCreator,
  // //       originToken: token.hash,
  // //       originSymbol: token.symbol,
  // //       fromChainId: event.returnValues._fromChainId,
  // //       originChainId: event.returnValues._originChainId,
  // //       toChainId: event.returnValues._toChainId,
  // //       amount: amount,
  // //       index: event.returnValues._index,
  // //       requestTime: block.timestamp,
  // //     },
  // //   },
  // //   { upsert: true, new: true }
  // // );
}

async function getPastEventForBatch(networkId: string, registryAddress: string, messengerAddress: string, generatorAddress: string, step: number, from: string, to: string) {
  console.log("Start getPastEventForBatch")
  let lastBlock = parseInt(to)
  let lastCrawl = parseInt(from)
  logger.info(`Network ${networkId} start batch from ${from} to ${to}`)

  let rpc_choosed = null
  while (lastBlock - lastCrawl > 0) {
    try {
      let toBlock;
      if (lastBlock - lastCrawl > step) {
        toBlock = lastCrawl + step;
      } else {
        toBlock = lastBlock;
      }
      let both = await Web3Utils.getWeb3AndRPC(networkId);
      let web3 = both.web3
      rpc_choosed = both.rpc
      let currentBlockForRPC = await web3.eth.getBlockNumber()
      if (parseInt(currentBlockForRPC) < toBlock) {
        logger.warning("invalid RPC %s, try again", rpc_choosed)
        continue
      }
      // Registry event
      {
        const contract = new web3.eth.Contract(RegistryBridgeABI, registryAddress);
        logger.info(
          "Network %s: Get Past Event from block %s to %s, lastblock %s of registry contract %s ",
          networkId,
          lastCrawl + 1,
          toBlock,
          lastBlock,
          registryAddress
        );
        let allEvents = await contract.getPastEvents("allEvents", {
          fromBlock: lastCrawl + 1,
          toBlock: toBlock,
        });
        if (allEvents.length > 0) {
          logger.info(
            `network ${networkId}: there are ${allEvents.length} events from ${lastCrawl + 1
            } to ${toBlock}`
          );
        }
        for (let i = 0; i < allEvents.length; i++) {
          let event = allEvents[i];
          if (event.event === 'StealthKeyChanged') {
            console.log("Find new RegisterKeys events")
            await processRegistryEvent(event, networkId);
          }
        }
      }
      // Annoucement event
      {
        const contractAnnoun = new web3.eth.Contract(MessengerABI, messengerAddress);
        logger.info(
          "Network %s: Get Past Event from block %s to %s, lastblock %s of messenger contract %s ",
          networkId,
          lastCrawl + 1,
          toBlock,
          lastBlock,
          messengerAddress
        );
        let allEvents = await contractAnnoun.getPastEvents("allEvents", {
          fromBlock: lastCrawl + 1,
          toBlock: toBlock,
        });
        if (allEvents.length > 0) {
          logger.info(
            `network ${networkId}: there are ${allEvents.length} events from ${lastCrawl + 1
            } to ${toBlock}`
          );
        }
        for (let i = 0; i < allEvents.length; i++) {
          let event = allEvents[i];
          if (event.event === 'Announcement') {
            console.log("=================")

            console.log("Find new Announcement events")
            await processAnnouncementEvent(event, networkId);
          }
        }
      }

      await sleep(1000);
      lastCrawl = toBlock;
    } catch (e) {
      logger.warn("Error network %s RPC: %s, waiting 5 seconds: %s", networkId, rpc_choosed, e)
      await sleep(5000)
    }
  }
}

/**
 * Check events in a bridge contract in an EVM chain with step
 * @param networkId network id (or chain id) of EVM a network
 * @param bridgeAddress contract address of bridge in this network
 * @param step step per time
 */
async function getPastEvent(networkId: string, registryAddress: string, messengerAddress: string, generatorAddress: string, step: number) {
  console.log("Start getPastEvent")

  try {
    let web3 = await Web3Utils.getWeb3(networkId);
    // console.log("web3: ", web3)
    const confirmations = config.get("blockchain")[networkId].confirmations;
    console.log("confirmation: ", confirmations)
    let lastBlock = await web3.eth.getBlockNumber();
    console.log("lastBlock: ", lastBlock)
    console.log("networkId: ", networkId)

    let lastCrawl = config.contracts[networkId].firstBlockCrawl
    console.log("lastCrawl: ", lastCrawl)

    if (lastCrawl === null) {
      lastCrawl = 27919810
    }

    console.log("getPassEvent networkId : ", networkId)
    // console.log("db: ", db)
    // console.log("Before")
    // let dbre = await db.Setting.find()
    // console.log("dbre : ", dbre)

    let setting = await SettingModel.findOne({ networkId: networkId })
    console.log("setting: ", setting)

    if (setting && setting.lastBlockRequest) {
      lastCrawl = setting.lastBlockRequest;
    }



    lastCrawl = parseInt(lastCrawl)
    lastBlock = parseInt(lastBlock) - confirmations

    let blockPerBatch = 30000
    let numBatch = Math.floor((lastBlock - lastCrawl) / blockPerBatch) + 1
    let tasks = []
    for (var i = 0; i < numBatch; i++) {
      let from = lastCrawl + i * blockPerBatch
      let to = lastCrawl + (i + 1) * blockPerBatch
      if (to > lastBlock) {
        to = lastBlock
      }
      console.log("push task: ", networkId, registryAddress, step, from, to)
      tasks.push(getPastEventForBatch(networkId, registryAddress, messengerAddress, generatorAddress, step, from, to))
    }

    await Promise.all(tasks)

    logger.info(
      `network ${networkId}: done for blocks from ${lastCrawl
      } to ${lastBlock}`
    );

    await updateBlock(networkId, lastBlock)
  } catch (e) {
    console.log(e);
  }
}

/**
 * Check all past events in a bridge contract in an EVM chain
 * @param networkId network id (or chain id) of EVM a network
 * @param bridgeAddress contract address of bridge in this network
 */
async function watch(networkId: string, registryAddress: string, messengerAddress: string, generatorAddress: string) {
  console.log("network: ", networkId, "registryAddress: ", registryAddress);
  let step = 1000;
  await getPastEvent(networkId, registryAddress, messengerAddress, generatorAddress, step);

  setInterval(async () => {
    await getPastEvent(networkId, registryAddress, messengerAddress, generatorAddress, step);
  }, 10000);
}

async function readStealthKeys(registrant: any, networkId: any) {

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


/**
 * Main function: check events in bridge contract in all EVM chain
 */
function main() {
  let contracts = config.contracts;
  console.log("contracts: ", contracts)
  console.log(config.crawlChainIds)
  console.log(config.networkTocrawl)
  let testnet = config.networkTocrawl
  console.log(testnet)
  let crawlChainId = config.crawlChainIds.testnet
  console.log("crawlChainId: ", crawlChainId)

  crawlChainId = parseInt(crawlChainId)
  let networks = Object.keys(contracts)
  console.log("networks: ", networks)
  networks.forEach((networkId) => {
    console.log("contracts[networkId]: ", contracts[networkId])
    // if (crawlChainId.includes(parseInt(networkId))) {
    let registryAddress = contracts[networkId].registryAddress
    console.log("registryAddress: ", registryAddress)
    let messengerAddress = contracts[networkId].announceAddress
    console.log("messengerAddress: ", messengerAddress)
    let generatorAddress = contracts[networkId].generatorAddress
    console.log("generatorAddress: ", generatorAddress)

    if (registryAddress !== "" && messengerAddress !== "" && generatorAddress !== "") {
      console.log("START !!!")
      watch(networkId, registryAddress, messengerAddress, generatorAddress)
    }
    // }
  })
}
a();

main();
