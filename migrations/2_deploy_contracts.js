// number these migration files
// so that the truffle knows the order of running it
// this file takes the smart contract and puts them on the blockchain
// this is just like in database we migrate database from one state to another and here we are migrating blockchain from one state to another
const Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
};
