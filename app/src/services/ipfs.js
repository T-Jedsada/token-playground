const ipfsAPI = require('ipfs-api');

export default ipfsAPI({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});
