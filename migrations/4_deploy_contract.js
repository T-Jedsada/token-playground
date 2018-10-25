const MaxToken = artifacts.require("MaxToken");
const Social = artifacts.require("Social");

module.exports = function(deployer) {
  deployer.deploy(MaxToken).then(() => {
    return deployer.deploy(Social, MaxToken.address);
  });
};
