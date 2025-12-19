const hre = require("hardhat");

async function main() {
  console.log("Deploying ChristmasGift contract...");

  const ChristmasGift = await hre.ethers.getContractFactory("ChristmasGift");
  const christmasGift = await ChristmasGift.deploy();

  await christmasGift.waitForDeployment();

  const address = await christmasGift.getAddress();
  console.log("ChristmasGift deployed to:", address);
  console.log("Network:", hre.network.name);
  
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
