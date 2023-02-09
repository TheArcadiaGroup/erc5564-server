const events = require("events");
const BigNumber = require("bignumber.js");
const config = require("config");

import logger from "./helpers/logger"
import Web3Utils from "./helpers/web3"
// const tokenHelper = require("./helpers/token");
import GenericBridge from "./contractABI/GenericBridge.json"
const db = require("./models");
// const CasperHelper = require("./helpers/casper");
// const CasperConfig = CasperHelper.getConfigInfo();
BigNumber.config({ EXPONENTIAL_AT: [-100, 100] });
const baseUnit = 10 ** 18;

// fix warning max listener
events.EventEmitter.defaultMaxListeners = 1000;
process.setMaxListeners(1000);
let sleep = (time: any) => new Promise((resolve) => setTimeout(resolve, time));


// /**
//  * store request bridge event info to database
//  *
//  * @param event Object of event
//  * @param networkId network id (or chain id) of EVM a network
//  */
// async function processRequestEvent(
//   event,
//   networkId) {
//   logger.info("New event at block %s", event.blockNumber);

//   let originChainId = event.returnValues._originChainId;
//   let tokenAddress = event.returnValues._token.toLowerCase();
//   let token = await tokenHelper.getToken(tokenAddress, originChainId);

//   let amount = event.returnValues._amount;

//   let web3 = await Web3Utils.getWeb3(networkId);
//   let block = await web3.eth.getBlock(event.blockNumber);

//   // event RequestBridge(address indexed _token, bytes indexed _addr, uint256 _amount, uint256 _originChainId, uint256 _fromChainId, uint256 _toChainId, uint256 _index);
//   let toAddrBytes = event.returnValues._toAddr;
//   let decoded;
//   try {
//     decoded = web3.eth.abi.decodeParameters(
//       [{ type: "string", name: "decodedAddress" }],
//       toAddrBytes
//     );
//   } catch (e) {
//     logger.error("cannot decode recipient address");
//     return;
//   }
//   let decodedAddress = decoded.decodedAddress;
//   let casperChainId = CasperConfig.networkId;
//   if (parseInt(event.returnValues._toChainId) === casperChainId) {
//     logger.info("bridging to casper network %s", decodedAddress);
//     if (decodedAddress.length === 64) {
//       decodedAddress = "account-hash-" + decodedAddress
//     }
//   }

//   //reading transaction creator
//   let transactionHash = event.transactionHash
//   let onChainTx = await web3.eth.getTransaction(transactionHash)
//   if (!onChainTx) return;
//   let txCreator = onChainTx.from.toLowerCase()
//   await db.Transaction.updateOne(
//     {
//       index: event.returnValues._index,
//       fromChainId: event.returnValues._fromChainId,
//       toChainId: event.returnValues._toChainId,
//     },
//     {
//       $set: {
//         requestHash: event.transactionHash,
//         requestBlock: event.blockNumber,
//         account: decodedAddress.toLowerCase(),
//         txCreator: txCreator,
//         originToken: token.hash,
//         originSymbol: token.symbol,
//         fromChainId: event.returnValues._fromChainId,
//         originChainId: event.returnValues._originChainId,
//         toChainId: event.returnValues._toChainId,
//         amount: amount,
//         index: event.returnValues._index,
//         requestTime: block.timestamp,
//       },
//     },
//     { upsert: true, new: true }
//   );
// }


// /**
//  * update claim event info to database
//  *
//  * @param event Object of event
//  */
// async function processClaimEvent(event) {
//   logger.info('New claim event at block %s', event.blockNumber)

//   // event ClaimToken(address indexed _token, address indexed _addr, uint256 _amount, uint256 _originChainId, uint256 _fromChainId, uint256 _toChainId, uint256 _index, bytes32 _claimId);
//   let requestTx = db.Transaction.findOne({
//     index: event.returnValues._index,
//     fromChainId: event.returnValues._fromChainId,
//     toChainId: event.returnValues._toChainId,
//     originChainId: event.returnValues._originChainId,
//     originToken: event.returnValues._token.toLowerCase()
//   })
//   if (!requestTx) {
//     logger.warn("Dont find request tx for claim event %s", event)
//   } else {
//     await db.Transaction.updateOne({
//       index: event.returnValues._index,
//       fromChainId: event.returnValues._fromChainId,
//       toChainId: event.returnValues._toChainId,
//       originChainId: event.returnValues._originChainId,
//       originToken: event.returnValues._token.toLowerCase()
//     },
//       {
//         $set: {
//           claimHash: event.transactionHash,
//           claimBlock: event.blockNumber,
//           claimed: true,
//           claimId: event.returnValues._claimId
//         }
//       }, { upsert: true, new: true })
//   }
// }

/**
 * update last block process in db.
 *
 * @param networkId network id (or chain id) of EVM a network
 * @param lastBlock last block processed
 */
async function updateBlock(networkId: string, lastBlock: number) {
  if (lastBlock) {
    let setting = await db.Setting.findOne({ networkId: networkId });
    if (!setting) {
      await db.Setting.updateOne(
        { networkId: networkId },
        { $set: { lastBlockRequest: lastBlock } },
        { upsert: true, new: true }
      );
    } else {
      if (lastBlock > setting.lastBlockRequest) {
        setting.lastBlockRequest = lastBlock
        await setting.save()
      }
    }
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
  let block = await web3.eth.getBlock(event.blockNumber);

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

async function getPastEventForBatch(networkId: string, bridgeAddress: string, step: number, from: string, to: string) {
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
      const contract = new web3.eth.Contract(GenericBridge, bridgeAddress);
      logger.info(
        "Network %s: Get Past Event from block %s to %s, lastblock %s",
        networkId,
        lastCrawl + 1,
        toBlock,
        lastBlock
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
        if (event.event === 'PrivateTransferInfo') {
          await processPrivateTransferInfoEvent(event, networkId);
        }
        // if (event.event === 'RequestBridge') {
        //   await processRequestEvent(event, networkId)
        // } else if (event.event === 'ClaimToken') {
        //   await processClaimEvent(event)
        // }
      }

      // console.log('sleep 2 seconds and wait to continue')
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
async function getPastEvent(networkId: string, ierc5564Address: string, step: number) {
  try {
    let web3 = await Web3Utils.getWeb3(networkId);
    const confirmations = config.get("blockchain")[networkId].confirmations;
    let lastBlock = await web3.eth.getBlockNumber();
    let setting = await db.Setting.findOne({ networkId: networkId })
    let lastCrawl = config.contracts[networkId].firstBlockCrawl
    if (lastCrawl === null) {
      lastCrawl = 9394711
    }
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
      console.log("push task: ", networkId, ierc5564Address, step, from, to)
      tasks.push(getPastEventForBatch(networkId, ierc5564Address, step, from, to))
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
async function watch(networkId: string, ierc5564Addrress: string) {
  console.log("network: ", networkId, "ierc5564Addrress: ", ierc5564Addrress);
  let step = 1000;
  await getPastEvent(networkId, ierc5564Addrress, step);

  setInterval(async () => {
    await getPastEvent(networkId, ierc5564Addrress, step);
  }, 10000);
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
    let contractAddress = contracts[networkId].ierc5564Address
    console.log("contractAddress: ", contractAddress)
    if (contractAddress !== "") {
      watch(networkId, contractAddress)
    }
    // }
  })
}

main();
