const Social = artifacts.require('Social')

module.exports = async function (deployer) {
  deployer.deploy(Social);
};