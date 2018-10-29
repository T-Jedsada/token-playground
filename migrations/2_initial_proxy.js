const TokenStorage = artifacts.require("TokenStorage")
const App = artifacts.require("App")

module.exports = async function (deployer) {
  deployer.deploy(TokenStorage).then(function () {
    return deployer.deploy(App, TokenStorage.address);
  });
};