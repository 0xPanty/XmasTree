// Deployment script for ChristmasPostcard contract
// Usage: node contracts/deploy.js

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORKS = {
    baseSepolia: {
        name: 'Base Sepolia (Testnet)',
        rpcUrl: 'https://sepolia.base.org',
        chainId: 84532,
        explorer: 'https://sepolia.basescan.org'
    },
    base: {
        name: 'Base Mainnet',
        rpcUrl: 'https://mainnet.base.org',
        chainId: 8453,
        explorer: 'https://basescan.org'
    }
};

async function deployContract(network = 'baseSepolia') {
    console.log(`\n🚀 Deploying ChristmasPostcard to ${NETWORKS[network].name}...\n`);
    
    // Get private key from environment
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('❌ DEPLOYER_PRIVATE_KEY not found in environment variables');
    }
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📝 Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');
    
    if (balance === 0n) {
        throw new Error('❌ Insufficient balance. Please fund your wallet.');
    }
    
    // Load contract ABI and bytecode
    // You need to compile the Solidity contract first using:
    // npx hardhat compile or solc
    console.log('⚠️  Make sure to compile the contract first!');
    console.log('   Run: npx hardhat compile\n');
    
    // For now, return instructions
    console.log('📋 Next steps:');
    console.log('1. Install dependencies:');
    console.log('   npm install --save-dev hardhat @openzeppelin/contracts');
    console.log('');
    console.log('2. Initialize Hardhat:');
    console.log('   npx hardhat init');
    console.log('');
    console.log('3. Copy ChristmasPostcard.sol to contracts/ folder');
    console.log('');
    console.log('4. Compile:');
    console.log('   npx hardhat compile');
    console.log('');
    console.log('5. Deploy:');
    console.log('   npx hardhat run contracts/deploy.js --network baseSepolia');
    console.log('');
    
    return {
        deployer: wallet.address,
        network: NETWORKS[network].name,
        ready: false
    };
}

// Alternative: Simple deployment without Hardhat
async function simpleDeployContract(network = 'baseSepolia') {
    console.log(`\n🚀 Simple deployment to ${NETWORKS[network].name}...\n`);
    
    // This requires pre-compiled bytecode
    // For production, use Hardhat or Foundry
    
    console.log('⚠️  This is a simplified deployment script.');
    console.log('📖 For production deployment, please use Hardhat:');
    console.log('');
    console.log('Quick start:');
    console.log('  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts');
    console.log('  npx hardhat init');
    console.log('  npx hardhat compile');
    console.log('  npx hardhat run scripts/deploy.js --network baseSepolia');
    console.log('');
}

// Run deployment
if (require.main === module) {
    deployContract('baseSepolia')
        .then((result) => {
            console.log('✅ Deployment script completed');
            console.log(JSON.stringify(result, null, 2));
        })
        .catch((error) => {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        });
}

module.exports = { deployContract };
