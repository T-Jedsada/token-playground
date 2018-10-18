import * as socialConfig from '../contracts/Social.json';

let Social = null;
let selectedNetwork = null;
let supportedNetworks = Object.keys(socialConfig.networks);

export default class Contracts {
  constructor() {
    throw new Error('Do not instantiate!');
  }

  static getSupportedNetworks = () => {
    return supportedNetworks;
  };

  static setNetwork = networkId => {
    if (supportedNetworks.indexOf(networkId) < 0) {
      throw new Error(
        `No configuration defined for network:${networkId}. Application supports only ${supportedNetworks.join(
          ','
        )}`
      );
    }
    selectedNetwork = networkId;
    let { web3 } = window;

    // initialize contracts
    Social = web3.eth
      .contract(socialConfig.abi)
      .at(socialConfig.networks[selectedNetwork].address);
  };

  static Social() {
    if (!Social)
      throw new Error(
        `You must first define the network. Call Contract.setNetwork}`
      );
    return Social;
  }

  static isSocialBytecode(bytecode) {
    return socialConfig.deployedBytecode === bytecode;
  }
}
