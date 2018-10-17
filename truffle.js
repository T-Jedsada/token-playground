var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env.truffle.local')
});

var HDWalletProvider = require('truffle-hdwallet-provider');

function getProvider(networkUrl) {
  return new HDWalletProvider(process.env.NMEMONIC, networkUrl);
}

module.exports = {
  contracts_build_directory: path.join(__dirname, 'app/src/contracts/'),
  solc: {
    optimizer: {
      enabled: true,
      runs: 2000
    }
  },
  mocha: {
    useColors: true,
    enableTimeouts: false
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    production: {
      provider: () => getProvider(process.env.MAINNET_URL),
      network_id: '1',
      from: process.env.ADDRESS_DEPLOY
    },
    ropsten: {
      provider: () => getProvider(process.env.ROPSTEN_URL),
      network_id: '3',
      from: process.env.ADDRESS_DEPLOY
    },
    rinkeby: {
      provider: () => getProvider(process.env.RINKEBY_URL),
      network_id: '4',
      from: process.env.ADDRESS_DEPLOY
    },
    kovan: {
      provider: () => getProvider(process.env.KOVAN_URL),
      network_id: '42',
      from: process.env.ADDRESS_DEPLOY
    }
  }
};