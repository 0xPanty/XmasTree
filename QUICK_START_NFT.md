# 🚀 Quick Start - NFT Deployment

## 最快部署流程（15分钟）

### 1. 安装依赖（2分钟）

```bash
cd H:\新星\ChristmasTree-main

npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
npm install ethers
```

### 2. 创建 .env 文件（1分钟）

在项目根目录创建 `.env`:

```
DEPLOYER_PRIVATE_KEY=你的私钥（不要0x前缀）
BASESCAN_API_KEY=可选
```

**⚠️ 重要：**
- 使用测试钱包，不要用主钱包！
- 不要提交 .env 到 git！

### 3. 获取测试 ETH（5分钟）

1. 去 [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. 输入你的钱包地址
3. 领取 0.05 ETH

### 4. 编译合约（1分钟）

```bash
npx hardhat compile
```

应该看到：
```
Compiled 1 Solidity file successfully
```

### 5. 部署到测试网（2分钟）

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

成功后会输出：
```
✅ Contract deployed successfully!
📍 Contract address: 0x...
```

**复制这个地址！** 你需要它来更新前端。

### 6. 更新前端代码（3分钟）

#### A. 在 index.html 添加 NFT 集成

在 `</head>` 前添加：

```html
<script src="nft-integration.js"></script>
```

#### B. 更新合约地址

在 `nft-integration.js` 第 8 行：

```javascript
const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS"; // 填入刚才的地址
```

#### C. 获取 NFT.Storage API Key

1. 去 https://nft.storage/
2. 注册账号（免费）
3. 创建 API Key
4. 在 `nft-integration.js` 第 18 行更新：

```javascript
const NFT_STORAGE_TOKEN = 'YOUR_NFT_STORAGE_TOKEN';
```

### 7. 修改发送流程（2分钟）

在 `index.html` 找到 `createDirectGift()` 函数，替换 IPFS 上传部分：

```javascript
// 原来的代码（第 5960 行左右）：
const USE_IPFS = true;

if (USE_IPFS) {
    // ... 旧的 Pinata 上传代码
}

// 替换为：
const USE_NFT = true;

if (USE_NFT) {
    console.log(`🎨 [${links.length + 1}/${selectedRecipients.length}] Minting NFT for @${r.username}...`);
    
    try {
        // 1. Upload to IPFS
        showLoading(`Uploading postcard ${i + 1}/${selectedRecipients.length} to IPFS...`);
        
        const ipfsCID = await window.NFTPostcard.uploadPostcardToIPFS(
            currentAIImage,
            personalizedBack,
            currentAIGreeting,
            currentUser,
            { fid: r.fid, username: r.username, pfp: r.pfp_url }
        );
        
        // 2. Get recipient address
        showLoading(`Getting recipient address...`);
        const recipientAddress = await window.NFTPostcard.getAddressFromFid(r.fid);
        
        // 3. Mint NFT
        showLoading(`Minting NFT ${i + 1}/${selectedRecipients.length}...`);
        const result = await window.NFTPostcard.mintPostcardNFT(
            recipientAddress,
            ipfsCID,
            currentAIGreeting
        );
        
        console.log('✅ NFT minted:', result.tokenId);
        
        // 4. Add to links
        links.push({ 
            username: r.username, 
            url: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
            nftUrl: `https://testnets.opensea.io/assets/base-sepolia/${CONTRACT_ADDRESS}/${result.tokenId}`
        });
        
    } catch (err) {
        console.error('❌ NFT minting failed:', err);
        
        // Show error to user
        showLoading(`Error: ${err.message}`);
        setTimeout(hideLoading, 3000);
        
        throw err; // Stop the loop
    }
}
```

### 8. 测试（1分钟）

1. 刷新页面
2. 生成明信片
3. 点击 "Send Gift"
4. 应该看到：
   - "Uploading postcard to IPFS..."
   - "Getting recipient address..."
   - "Minting NFT..."
   - MetaMask 弹窗签名
   - "✅ Postcard sent!"
5. 点击链接查看：
   - Basescan: 查看交易
   - OpenSea: 查看 NFT

## 🎉 完成！

现在你的明信片会：
- ✅ 完整图片上传到 IPFS（NFT.Storage 处理大文件）
- ✅ Mint 成 NFT 到收件人钱包
- ✅ 收件人在 OpenSea 看到
- ✅ 永久保存在链上

## 📊 成本

- 测试网：**完全免费**（使用 faucet ETH）
- 主网：每次 mint **~$0.0003**（非常便宜）

## 🐛 问题排查

### "No ETH for gas"
→ 去 faucet 领取更多测试 ETH

### "Transaction rejected"
→ 用户取消了签名，重试即可

### "Failed to get address from FID"
→ 收件人没有绑定 ETH 地址，需要他们先绑定

### "IPFS upload timeout"
→ 图片太大或网络慢，重试或压缩图片

## 下一步

1. ✅ 测试多次发送
2. ✅ 测试不同收件人
3. ✅ 确认 OpenSea 显示正确
4. ✅ 准备部署到主网：
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```

需要帮助？查看完整文档：`NFT_DEPLOYMENT_GUIDE.md`
