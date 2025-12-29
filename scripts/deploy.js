// Hardhat deployment script for ChristmasPostcard
// Usage: npx hardhat run scripts/deploy.js --network baseSepolia

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🎄 Deploying ChristmasPostcard NFT Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n❌ Error: Account has no balance!");
    console.log("Please fund your account with some ETH:");
    console.log("  - Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    console.log("  - Or bridge from Sepolia: https://bridge.base.org");
    process.exit(1);
  }

  console.log("\n⏳ Deploying contract...");

  // Deploy contract
  const ChristmasPostcard = await hre.ethers.getContractFactory("ChristmasPostcard");
  const contract = await ChristmasPostcard.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Explorer:", `https://${hre.network.name === 'base' ? '' : 'sepolia.'}basescan.org/address/${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction()?.hash
  };

  // Save to file
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction()?.wait(5);
  console.log("✅ Confirmed!");

  // Verify contract on Basescan (if API key is set)
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n⏳ Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("You can verify manually at:", `https://${hre.network.name === 'base' ? '' : 'sepolia.'}basescan.org/verifyContract`);
    }
  } else {
    console.log("\n⚠️  BASESCAN_API_KEY not set, skipping verification");
    console.log("To verify manually:");
    console.log("  npx hardhat verify --network", hre.network.name, contractAddress);
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update index.html with contract address:");
  console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log("2. Update CONTRACT_ABI with the compiled ABI from artifacts/");
  console.log("3. Test minting on testnet");
  console.log("4. Deploy to mainnet when ready");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
