# Deploy Based Stamp NFT Contract

## Option 1: Remix IDE (No setup required)

### Steps:
1. Go to https://remix.ethereum.org/
2. Create new file: `BasedStamp.sol`
3. Paste the contract code
4. Install OpenZeppelin:
   - Go to "File Explorer" tab
   - Click ".deps" → "npm"
   - It will auto-install when compiling
5. Compile:
   - Solidity Compiler tab
   - Version: 0.8.20+
   - Click "Compile"
6. Deploy:
   - "Deploy & Run" tab
   - Environment: "Injected Provider - MetaMask"
   - Network: Switch MetaMask to **Base Mainnet**
   - Click "Deploy"
   - Confirm transaction (costs ~$0.50-2 in gas)
7. Copy contract address from "Deployed Contracts"

---

## Option 2: Hardhat (For developers)

### Setup:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npx hardhat init
```

### hardhat.config.js:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Deploy script (scripts/deploy.js):
```javascript
async function main() {
  const BasedStamp = await ethers.getContractFactory("BasedStamp");
  const basedStamp = await BasedStamp.deploy();
  await basedStamp.waitForDeployment();
  
  console.log("BasedStamp deployed to:", await basedStamp.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Deploy:
```bash
npx hardhat run scripts/deploy.js --network base
```

---

## Base Network Details

**Base Mainnet:**
- RPC: https://mainnet.base.org
- Chain ID: 8453
- Explorer: https://basescan.org/

**Base Sepolia (Testnet):**
- RPC: https://sepolia.base.org
- Chain ID: 84532
- Explorer: https://sepolia.basescan.org/
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## After Deployment

1. **Verify contract on BaseScan:**
   ```bash
   npx hardhat verify --network base CONTRACT_ADDRESS
   ```

2. **Update code with contract address:**
   - Replace `0xYourBasedNFTContractAddress` with actual address
   - Update ABI to match your contract

3. **Test minting:**
   - Call `mint()` function from BaseScan
   - Or test in your app

---

## Cost Estimates

- **Deploy contract:** ~$1-5 (depends on gas)
- **Mint NFT:** ~$0.10-0.50 per mint (free mint, only gas)
- **Base gas fees:** Very low compared to Ethereum mainnet

---

## Recommended: Start with Testnet

Deploy to Base Sepolia first to test everything for free!
