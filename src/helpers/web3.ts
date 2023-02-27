import Web3 from 'web3';
import Account from "web3-eth-accounts"
import SampleRegistryABI from '../contractABI/SampleRegistry.json'
import SampleGeneratorABI from '../contractABI/SampleGenerator.json'
import { EHOSTUNREACH } from 'constants';
const config = require('config')
interface Web3AndRPC {
    web3: any;
    rpc: string;
}

let Web3Util = {
    // genRanHex: async (size = 64): Promise<any> => {
    //     [...Array(size)]
    //         .map(() => Math.floor(Math.random() * 16).toString(16))
    //         .join("")
    // },
    getWeb3: async (networkId: any): Promise<any> => {
        let both = await Web3Util.getWeb3AndRPC(networkId);
        return both.web3;
    },
    getRegistryContract: async (networkId: any) => {
        let web3 = await Web3Util.getWeb3(networkId);
        let contract = await new web3.eth.Contract(SampleRegistryABI, config.contracts[networkId].bridge);
        return contract;
    },
    getWeb3AndRPC: async (networkId: any): Promise<Web3AndRPC> => {
        let list: string[] = [];
        if (Array.isArray(config.blockchain[networkId].httpProvider)) {
            list = config.blockchain[networkId].httpProvider;
        } else {
            list.push(config.blockchain[networkId].httpProvider);
        }
        let len = list.length;
        let random = Math.floor(Math.random() * len);
        let rpc = list[random];
        return { web3: new Web3(new Web3.providers.HttpProvider(rpc)), rpc: rpc };
    },
    getWeb3Socket: async (networkId: any): Promise<Web3> => {
        return new Web3(new Web3.providers.WebsocketProvider(config.get('blockchain')[networkId].wsProvider));
    },
    getRandomHex: async (): Promise<any> => {
        let hex = await Web3.utils.randomHex(32)
        return hex;
    },
    createAccount: async (networkId: any, str: any): Promise<any> => {
        let web3 = await Web3Util.getWeb3(networkId);

        let newAcc = new web3.eth.accounts.create(str)
        return newAcc;
    },

}

export default Web3Util;



