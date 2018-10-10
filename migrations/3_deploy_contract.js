const MyToken = artifacts.require('MyToken')

module.exports = async function (deployer) {
  deployer.deploy(MyToken);
};