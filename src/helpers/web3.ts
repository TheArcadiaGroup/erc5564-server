import Web3 from'web3';
import GenericBridgeABI from '../contractABI/PubStealthInfoContract.json'
const config = require('config')
interface Web3AndRPC {
    web3: any;
    rpc: string;
}

let Web3Util = {
    getWeb3: async (networkId: any): Promise<any> => {
        let both = await Web3Util.getWeb3AndRPC(networkId);
        return both.web3;
    },
    getBridgeContract: async (networkId: any) => {
        let web3 = await Web3Util.getWeb3(networkId);
        let contract = await new web3.eth.Contract(GenericBridgeABI, config.contracts[networkId].bridge);
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
}

export default Web3Util;



