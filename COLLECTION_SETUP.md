# 🎨 NFT Collection Setup Guide

## 什么是 NFT 合集？

你的智能合约 = **一个 NFT 合集**

所有人发送的明信片都会被 mint 到这个合集里：

```
🎄 Christmas Postcard Collection (XMAS)
│
├── Token #0: alice → bob 的明信片
├── Token #1: charlie → david 的明信片
├── Token #2: alice → eve 的明信片
└── ... (无限增长)
```

---

## 📊 **在 OpenSea 上的显示：**

### **合集页面：**
- **名称**: Christmas Postcard
- **符号**: XMAS
- **描述**: AI-generated Christmas postcards...
- **总量**: 动态增长（每次有人发送）
- **持有人数**: 收到明信片的人数

### **单个 NFT 页面：**
每张明信片显示：
- 前面图片（AI 生成）
- 背面图片（个性化地址面）
- 发送者
- 接收者
- 消息内容
- 时间戳

---

## 🎨 **准备合集资源：**

### **1. 合集封面 (Collection Image)** 📷
- **尺寸**: 350x350px（推荐）
- **格式**: PNG/JPG
- **内容**: 合集的代表图片

**建议**：
- 使用圣诞主题
- 明信片样式
- 清晰的 logo 或图标

**示例**：
```
🎄
Christmas
Postcard
```

### **2. Banner 图片** 🖼️
- **尺寸**: 1400x400px（推荐）
- **格式**: PNG/JPG
- **内容**: 合集的横幅

**建议**：
- 节日氛围
- 展示明信片样例
- 品牌信息

### **3. Featured 图片** ⭐
- **尺寸**: 600x400px（推荐）
- **格式**: PNG/JPG
- **内容**: 精选展示图

---

## 📤 **上传步骤：**

### **方式 1: 使用 NFT.Storage（推荐）**

```bash
# 1. 安装 NFT.Storage CLI
npm install -g @nftstorage/cli

# 2. 登录
nft-storage login

# 3. 上传封面
nft-storage upload collection-image.png
# 返回: ipfs://QmABC123...

# 4. 上传 banner
nft-storage upload collection-banner.png
# 返回: ipfs://QmDEF456...

# 5. 上传 featured
nft-storage upload collection-featured.png
# 返回: ipfs://QmGHI789...
```

### **方式 2: 使用 Pinata**

1. 去 https://pinata.cloud/
2. 上传图片
3. 复制 IPFS CID

---

## 📝 **更新合集元数据：**

### **1. 编辑 collection-metadata.json**

```json
{
  "name": "Christmas Postcard",
  "description": "AI-generated Christmas postcards minted as NFTs on Base. Each postcard is a unique greeting sent from one Farcaster user to another.",
  "image": "ipfs://QmABC123...",  // 你的封面 CID
  "banner_image": "ipfs://QmDEF456...",  // 你的 banner CID
  "featured_image": "ipfs://QmGHI789...",  // 你的 featured CID
  "external_link": "https://xmas-tree-opal.vercel.app",
  "seller_fee_basis_points": 0,
  "fee_recipient": "0x0000000000000000000000000000000000000000"
}
```

### **2. 上传元数据文件**

```bash
nft-storage upload collection-metadata.json
# 返回: ipfs://QmJKL012...
```

### **3. 在合约中设置**

部署后，调用 `setCollectionURI`:

```javascript
const contract = await getContract();
await contract.setCollectionURI("ipfs://QmJKL012...");
```

或者使用 Hardhat:

```bash
npx hardhat run scripts/set-collection-uri.js --network baseSepolia
```

---

## 🚀 **自动化脚本：**

创建 `scripts/set-collection-uri.js`:

```javascript
const hre = require("hardhat");

async function main() {
    const contractAddress = "0xYOUR_CONTRACT_ADDRESS";
    const collectionURI = "ipfs://QmYOUR_COLLECTION_METADATA";
    
    const contract = await hre.ethers.getContractAt(
        "ChristmasPostcard",
        contractAddress
    );
    
    console.log("Setting collection URI...");
    const tx = await contract.setCollectionURI(collectionURI);
    await tx.wait();
    
    console.log("✅ Collection URI updated!");
    console.log("View on OpenSea (after ~10 min):");
    console.log(`https://testnets.opensea.io/assets/base-sepolia/${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

运行：
```bash
npx hardhat run scripts/set-collection-uri.js --network baseSepolia
```

---

## 🎯 **部署后在 OpenSea 上显示：**

### **时间线：**
1. **部署合约** → 立即在 Basescan 显示
2. **第一次 mint** → OpenSea 自动检测合集
3. **设置元数据** → ~10 分钟后 OpenSea 更新
4. **完整显示** → 封面、banner、描述都显示

### **手动刷新（可选）：**
1. 去 OpenSea
2. 找到你的合集
3. 点击右上角的 "..." 
4. 选择 "Refresh metadata"

---

## ✅ **检查清单：**

部署前：
- [ ] 准备好封面图 (350x350px)
- [ ] 准备好 banner (1400x400px)
- [ ] 准备好描述文字
- [ ] 上传所有图片到 IPFS
- [ ] 创建并上传 collection-metadata.json

部署后：
- [ ] 合约部署成功
- [ ] 调用 `setCollectionURI()`
- [ ] 在 OpenSea 搜索合约地址
- [ ] 等待 10 分钟刷新
- [ ] 测试 mint 一张明信片
- [ ] 检查 OpenSea 显示

---

## 📚 **OpenSea 合集标准：**

你的合约已经实现了：
- ✅ `name()` - 合集名称："Christmas Postcard"
- ✅ `symbol()` - 合集符号："XMAS"
- ✅ `contractURI()` - 合集元数据
- ✅ `tokenURI(tokenId)` - 单个 NFT 元数据
- ✅ `totalSupply()` - NFT 总量
- ✅ ERC721 标准

OpenSea 会自动检测并显示！

---

## 🎨 **可选：Royalty（版税）**

如果你想设置版税（每次二级销售收取费用）：

```json
{
  "seller_fee_basis_points": 250,  // 2.5% = 250 基点
  "fee_recipient": "0xYourWallet"  // 接收版税的地址
}
```

**建议**：
- 0% = 不收费（推荐，让用户自由转让）
- 2.5% = 标准版税
- 5% = 较高版税

---

## 🌟 **Tips：**

1. **先在测试网部署**，确认 OpenSea 显示正确
2. **使用高质量图片**，第一印象很重要
3. **写清楚描述**，让人一眼看懂这是什么
4. **保持风格一致**，所有图片统一圣诞主题
5. **在 Farcaster 宣传**，让更多人知道这个合集

---

## 📊 **预期效果：**

部署后，所有人都可以：
- 在 OpenSea 看到 "Christmas Postcard" 合集
- 看到合集里所有的明信片
- 看到总发送量、持有人数
- 点击单个明信片查看详情
- 转让/交易自己收到的明信片（如果你允许）

**就像一个公共的明信片博物馆！** 🏛️

---

需要帮助准备图片或有其他问题？告诉我！
