// Set Collection URI for OpenSea
// Usage: npx hardhat run scripts/set-collection-uri.js --network baseSepolia

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🎨 Setting Collection URI for OpenSea...\n");

    // Read deployment info
    const deploymentPath = path.join(__dirname, "..", "deployment.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ deployment.json not found!");
        console.log("Please deploy the contract first:");
        console.log("  npx hardhat run scripts/deploy.js --network baseSepolia");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.contractAddress;

    console.log("📍 Contract address:", contractAddress);
    console.log("🌐 Network:", deployment.network);

    // Read collection metadata
    const metadataPath = path.join(__dirname, "..", "collection-metadata.json");
    if (!fs.existsSync(metadataPath)) {
        console.error("❌ collection-metadata.json not found!");
        console.log("\nPlease create collection-metadata.json with:");
        console.log(JSON.stringify({
            name: "Christmas Postcard",
            description: "AI-generated Christmas postcards...",
            image: "ipfs://YOUR_COLLECTION_IMAGE_CID",
            banner_image: "ipfs://YOUR_BANNER_CID",
            external_link: "https://xmas-tree-opal.vercel.app"
        }, null, 2));
        process.exit(1);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

    // Check if metadata was uploaded to IPFS
    if (metadata.image === "ipfs://QmYOUR_COLLECTION_IMAGE") {
        console.log("\n⚠️  Warning: You haven't uploaded collection images to IPFS yet!");
        console.log("\nSteps:");
        console.log("1. Prepare collection images (see COLLECTION_SETUP.md)");
        console.log("2. Upload to IPFS using NFT.Storage or Pinata");
        console.log("3. Update collection-metadata.json with IPFS CIDs");
        console.log("4. Upload collection-metadata.json to IPFS");
        console.log("5. Run this script again with the metadata IPFS CID");
        console.log("");
        
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const collectionURI = await new Promise(resolve => {
            readline.question("Enter IPFS CID for collection metadata (or press Enter to skip): ", answer => {
                readline.close();
                resolve(answer.trim());
            });
        });
        
        if (!collectionURI) {
            console.log("❌ Cancelled. Please upload metadata first.");
            process.exit(0);
        }
        
        console.log("\n✅ Using CID:", collectionURI);
        
        const contract = await hre.ethers.getContractAt("ChristmasPostcard", contractAddress);
        
        const fullURI = collectionURI.startsWith("ipfs://") 
            ? collectionURI 
            : `ipfs://${collectionURI}`;
        
        console.log("\n⏳ Setting collection URI to:", fullURI);
        const tx = await contract.setCollectionURI(fullURI);
        console.log("📝 Transaction:", tx.hash);
        
        await tx.wait();
        console.log("✅ Collection URI updated!");
        
    } else {
        console.log("\n📋 Collection Metadata:");
        console.log("  Name:", metadata.name);
        console.log("  Description:", metadata.description.substring(0, 50) + "...");
        console.log("  Image:", metadata.image);
        
        console.log("\n⚠️  Before continuing:");
        console.log("1. Make sure you've uploaded collection-metadata.json to IPFS");
        console.log("2. Have the IPFS CID ready");
        console.log("");
        
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const collectionURI = await new Promise(resolve => {
            readline.question("Enter IPFS CID for collection metadata: ", answer => {
                readline.close();
                resolve(answer.trim());
            });
        });
        
        if (!collectionURI) {
            console.log("❌ No CID provided. Cancelled.");
            process.exit(0);
        }
        
        const contract = await hre.ethers.getContractAt("ChristmasPostcard", contractAddress);
        
        const fullURI = collectionURI.startsWith("ipfs://") 
            ? collectionURI 
            : `ipfs://${collectionURI}`;
        
        console.log("\n⏳ Setting collection URI to:", fullURI);
        const tx = await contract.setCollectionURI(fullURI);
        console.log("📝 Transaction:", tx.hash);
        
        await tx.wait();
        console.log("✅ Collection URI updated!");
    }

    console.log("\n🎉 Done!");
    console.log("\n📋 Next steps:");
    console.log("1. Wait ~10 minutes for OpenSea to index");
    console.log("2. View your collection:");
    const isTestnet = hre.network.name === "baseSepolia";
    const openseaUrl = isTestnet
        ? `https://testnets.opensea.io/assets/base-sepolia/${contractAddress}`
        : `https://opensea.io/assets/base/${contractAddress}`;
    console.log("   ", openseaUrl);
    console.log("3. Mint a test postcard to see it appear!");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
