const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Transfer
  const Transfer = await hre.ethers.getContractFactory("NFTTranster");
  const raffle = await Transfer.deploy();
  await raffle.waitForDeployment();

  const raffleAddress = await raffle.getAddress();
  console.log("Transfer deployed to:", raffleAddress);
  console.log("Deployer:", deployer.address);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
