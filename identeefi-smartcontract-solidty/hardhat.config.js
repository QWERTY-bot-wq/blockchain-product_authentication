require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { task } = require("hardhat/config");

// Custom task to print accounts
task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,       // ✅ full RPC URL from .env
      accounts: [process.env.PRIVATE_KEY] // ✅ private key from .env
    },
    localhost: {
      url: "http://127.0.0.1:8545"        // ✅ local Hardhat node
    }
  }
};
