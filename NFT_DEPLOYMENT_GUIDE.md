# 🎄 Christmas Postcard NFT - Deployment Guide

## Overview

This guide will help you deploy the ChristmasPostcard NFT contract and integrate it into your Farcaster Mini App.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Wallet with ETH** on Base Sepolia (testnet) or Base (mainnet)
3. **Private key** of deployer wallet
4. **Base Sepolia ETH** from faucet (for testnet)

## 🚀 Step 1: Install Dependencies

```bash
cd H:\新星\ChristmasTree-main

# Install Hardhat and OpenZeppelin
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# Install ethers.js for frontend
npm install ethers
```

## 🔑 Step 2: Setup Environment Variables

Create `.env` file in project root:

```bash
# Deployer wallet private key (DO NOT COMMIT THIS!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional: For contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

**Security Warning:** 
- ⚠️ NEVER commit `.env` to git
- ⚠️ Use a separate wallet for deployment (not your main wallet)
- ⚠️ Add `.env` to `.gitignore`

## 💰 Step 3: Fund Your Wallet

### For Base Sepolia (Testnet):
1. Go to [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Enter your wallet address
3. Request 0.05 ETH (enough for ~500 mints)

### For Base Mainnet:
1. Bridge ETH from Ethereum to Base: https://bridge.base.org
2. You'll need ~0.01 ETH ($30) for deployment + initial mints

## 🔨 Step 4: Compile Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

## 🚀 Step 5: Deploy to Testnet

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia
```

Expected output:
```
🎄 Deploying ChristmasPostcard NFT Contract...

📝 Deploying with account: 0x...
💰 Account balance: 0.05 ETH

⏳ Deploying contract...
✅ Contract deployed successfully!
📍 Contract address: 0x1234567890abcdef...
🔗 Explorer: https://sepolia.basescan.org/address/0x1234...

💾 Deployment info saved to: deployment.json
⏳ Verifying contract on Basescan...
✅ Contract verified!

🎉 Deployment complete!
```

## 📝 Step 6: Update Frontend Code

After deployment, you'll get a `deployment.json` file with:
- Contract address
- Network info
- Deployment timestamp

Update `index.html` with:

```javascript
// Add at the top of script section
const CONTRACT_ADDRESS = "0x..."; // From deployment.json

// Contract ABI (from artifacts/contracts/ChristmasPostcard.sol/ChristmasPostcard.json)
const CONTRACT_ABI = [...]; // Copy from artifacts
```

## 🧪 Step 7: Test on Testnet

1. Open your Mini App
2. Generate a postcard
3. Click "Send Gift"
4. Should see:
   - "Uploading to IPFS..."
   - "Minting NFT..."
   - Metamask popup for signature
   - "✅ Postcard sent!"
5. Check transaction on Basescan
6. Check NFT on OpenSea testnet

## 🎉 Step 8: Deploy to Mainnet

Once testing is complete:

```bash
npx hardhat run scripts/deploy.js --network base
```

**Important:**
- Test thoroughly on testnet first!
- Mainnet deployment costs real money (~$3-5)
- Each mint costs ~$0.0003 in gas

## 📊 Contract Functions

### Mint Postcard
```javascript
await contract.mintPostcard(
    recipientAddress,  // 0x...
    ipfsCID,          // "Qm..."
    message           // "Merry Christmas!"
)
```

### Get Postcards by Sender
```javascript
const tokenIds = await contract.getPostcardsBySender(senderAddress);
```

### Get Postcard Metadata
```javascript
const postcard = await contract.postcards(tokenId);
// Returns: { ipfsCID, sender, recipient, timestamp, message }
```

## 🔍 Verification

### Verify Contract Manually
```bash
npx hardhat verify --network baseSepolia 0xYOUR_CONTRACT_ADDRESS
```

### Check on Basescan
- Testnet: https://sepolia.basescan.org/address/YOUR_ADDRESS
- Mainnet: https://basescan.org/address/YOUR_ADDRESS

## 🐛 Troubleshooting

### "Insufficient balance"
- Fund wallet with more ETH from faucet or bridge

### "Transaction failed"
- Check gas price (increase if network is congested)
- Ensure recipient address is valid
- Check IPFS CID is not empty

### "Contract verification failed"
- Wait 1-2 minutes after deployment
- Try manual verification
- Check BASESCAN_API_KEY is correct

## 💰 Cost Estimates

### Testnet (Base Sepolia)
- Deployment: FREE (faucet ETH)
- Per mint: FREE (faucet ETH)

### Mainnet (Base)
- Deployment: ~$3-5 (one-time)
- Per mint: ~$0.0003 (very cheap!)
- 1000 mints = ~$0.30

## 🔐 Security Checklist

- [ ] Private key in `.env` only
- [ ] `.env` added to `.gitignore`
- [ ] Using separate wallet for deployment
- [ ] Tested on testnet first
- [ ] Contract verified on Basescan
- [ ] Audit contract code (for production)

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Base Documentation](https://docs.base.org/)
- [Basescan](https://basescan.org/)

## 🎯 Next Steps

After successful deployment:

1. ✅ Update frontend with contract address
2. ✅ Integrate NFT.Storage for IPFS upload
3. ✅ Add mint functionality to Send Gift flow
4. ✅ Test end-to-end on testnet
5. ✅ Deploy to mainnet
6. ✅ Celebrate! 🎉
