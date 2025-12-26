# 🔧 需要修复的配置问题

## 🚨 高优先级：修复Warplet合约地址不一致

### 问题
代码中有两个不同的Warplet NFT合约地址：

1. **api/neynar.js** (line 148):
   ```javascript
   const WARPLET_CONTRACT = '0x532Cd2d1db5901694eAF0ad86Ed81a6614925a42';
   ```

2. **api/warplet.js** (line 77, 178):
   ```javascript
   const WARPLET_CONTRACT = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
   ```

### 解决方案

#### 步骤1：确认正确的合约地址

访问 **OpenSea**:
https://opensea.io/collection/the-warplets-farcaster

在collection页面，点击任意NFT，查看"Details"部分找到**Contract Address**

或者在 **BaseScan** 搜索:
https://basescan.org/

搜索 "The Warplets" 或 "Warplet"

#### 步骤2：统一合约地址

假设正确地址是 `0x699727f9e01a822efdcf7333073f0461e5914b4e` (来自warplet.js)

修改 `api/neynar.js` line 148:

**之前：**
```javascript
const WARPLET_CONTRACT = '0x532Cd2d1db5901694eAF0ad86Ed81a6614925a42';
```

**之后：**
```javascript
const WARPLET_CONTRACT = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
```

#### 步骤3：更好的做法 - 使用环境变量

在两个文件中都改为：

```javascript
const WARPLET_CONTRACT = process.env.WARPLET_CONTRACT || '0x699727f9e01a822efdcf7333073f0461e5914b4e';
```

然后在Vercel添加环境变量：
```
WARPLET_CONTRACT=0x699727f9e01a822efdcf7333073f0461e5914b4e
```

---

## 📝 推荐优化

### 1. 添加环境变量到 .env.example

更新 `.env.example` 文件：

```bash
# 部署钱包私钥 (不要泄露!)
PRIVATE_KEY=your_private_key_here

# BaseScan API Key (用于验证合约，可选)
BASESCAN_API_KEY=your_basescan_api_key

# Gemini API Key (用于生成AI贺卡)
GEMINI_API_KEY=your_gemini_api_key

# Neynar API Key (必需 - 用于Farcaster数据)
NEYNAR_API_KEY=your_neynar_api_key

# Alchemy API Key (推荐 - 用于可靠的NFT检测)
ALCHEMY_API_KEY=your_alchemy_api_key

# SimpleHash API Key (可选 - Alchemy的替代方案)
SIMPLEHASH_API_KEY=your_simplehash_api_key

# Warplet NFT Contract Address (Base链)
WARPLET_CONTRACT=0x699727f9e01a822efdcf7333073f0461e5914b4e
```

### 2. 在Vercel Dashboard添加环境变量

访问：https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/settings/environment-variables

添加以下变量（如果还没有）：

| Key | Value | Environment |
|-----|-------|-------------|
| `GEMINI_API_KEY` | AIzaSyA... | Production, Preview, Development |
| `NEYNAR_API_KEY` | A8C2B3A... | Production, Preview, Development |
| `ALCHEMY_API_KEY` | (待获取) | Production, Preview, Development |
| `WARPLET_CONTRACT` | 0x699727... | Production, Preview, Development |

#### 获取 ALCHEMY_API_KEY:

1. 访问 https://www.alchemy.com/
2. 注册免费账户
3. 创建新App:
   - Chain: **Base Mainnet**
   - Network: **Base**
4. 复制 API Key
5. 添加到Vercel环境变量

---

## 🧪 测试清单

完成修复后，运行以下测试：

### 本地测试（如果配置了.env.local）

```bash
# 运行测试脚本
./test-apis.sh

# 或手动测试
curl "https://xmas-tree-opal.vercel.app/api/neynar?action=check_stamps&fid=5650"
curl "https://xmas-tree-opal.vercel.app/api/warplet?fid=5650"
```

### Farcaster客户端测试

1. 打开 Warpcast (https://warpcast.com/)
2. 发送一个包含你的链接的cast
3. 验证Mini App按钮显示
4. 点击按钮，测试功能：
   - [ ] 用户信息正确加载
   - [ ] 用户搜索功能正常
   - [ ] 邮票资格检查正确
   - [ ] Warplet NFT检测正确
   - [ ] 礼物发送功能正常

---

## 🎯 快速修复命令

如果你确认正确地址是 `0x699727f9e01a822efdcf7333073f0461e5914b4e`:

```bash
cd /Users/huan/XmasTree

# 修复neynar.js中的地址
sed -i.bak "s/0x532Cd2d1db5901694eAF0ad86Ed81a6614925a42/0x699727f9e01a822efdcf7333073f0461e5914b4e/g" api/neynar.js

# 验证修改
grep "0x699727" api/neynar.js
grep "0x699727" api/warplet.js

# 提交更改
git add api/neynar.js
git commit -m "Fix: Unify Warplet contract address across APIs"
git push origin master
```

Vercel会自动重新部署。

---

## 📊 部署后验证

### 1. 检查部署状态
https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/deployments

### 2. 查看日志
https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/logs

### 3. 测试关键功能

在浏览器控制台（F12）测试：

```javascript
// 测试Farcaster SDK加载
console.log(window.farcasterSDK);

// 测试API调用（替换为实际FID）
fetch('/api/neynar?action=check_stamps&fid=5650')
  .then(r => r.json())
  .then(d => console.log('Stamps:', d));

fetch('/api/warplet?fid=5650')
  .then(r => r.json())
  .then(d => console.log('Warplet:', d));
```

---

## 🎄 准备发布

完成所有修复和测试后：

1. ✅ 统一Warplet合约地址
2. ✅ 添加所有必需的环境变量
3. ✅ 测试所有API端点
4. ✅ 在Farcaster客户端测试Mini App
5. ✅ 检查错误日志

然后在Farcaster发布你的Mini App! 🚀

### 示例发布Cast:

```
🎄✨ Introducing Jingle Gift - The ultimate Farcaster Christmas experience!

🎁 Send personalized gifts to friends
🌲 Interactive 3D Christmas tree
🎨 AI-generated postcards
🏅 Free stamps for eligible users

Try it now and spread the holiday joy! 

https://xmas-tree-opal.vercel.app
```

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Vercel 日志
2. 查看浏览器控制台错误
3. 验证所有环境变量已正确设置
4. 确认API keys有效且未过期
5. 测试网络连接和API响应

参考文档：
- Farcaster Mini Apps: https://miniapps.farcaster.xyz/
- Neynar API: https://docs.neynar.com/
- Vercel部署: https://vercel.com/docs
