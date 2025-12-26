# Farcaster Mini App 部署检查清单

## ✅ 已完成
- [x] Farcaster Mini App 元数据配置（index.html line 14）
- [x] @farcaster/miniapp-sdk 集成
- [x] Neynar API 集成（用户、好友、邮票检查）
- [x] Vercel 部署配置（vercel.json）
- [x] 基础环境变量配置（GEMINI_API_KEY, NEYNAR_API_KEY）

## 🔧 需要完成的任务

### 1. 环境变量配置（在Vercel仪表板）

访问：https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/settings/environment-variables

添加以下环境变量：

```bash
# 必需 - 已配置
GEMINI_API_KEY=AIzaSyAByvgerGSj-O33c4ptWc-ef0FowqZkWH4
NEYNAR_API_KEY=A8C2B3A3-AA8B-4E53-86F3-3E218D70A9BD

# 推荐添加 - 提高NFT检测可靠性
ALCHEMY_API_KEY=your_alchemy_key
# 或
SIMPLEHASH_API_KEY=your_simplehash_key

# 可选 - 智能合约部署（如果需要）
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_key
```

**获取API Keys：**
- Alchemy: https://www.alchemy.com/ (免费，选择Base Mainnet)
- SimpleHash: https://simplehash.com/ (免费tier可用)

### 2. 代码优化

#### 修复Warplet合约地址不一致：
- `api/neynar.js` line 104: `0x532Cd2d1db5901694eAF0ad86Ed81a6614925a42`
- `api/warplet.js` line 61: `0x699727f9e01a822efdcf7333073f0461e5914b4e`

需要确认正确的Warplet合约地址：
- 访问 https://basescan.org
- 搜索 "The Warplets" 或在 https://opensea.io/collection/the-warplets-farcaster 查看

### 3. Mini App 元数据验证

当前配置（index.html line 14）：
```html
<meta name="fc:miniapp" content='{
  "version":"1",
  "imageUrl":"https://xmas-tree-opal.vercel.app/preview.svg",
  "button":{
    "title":"🎁 Open",
    "action":{
      "type":"launch_frame",
      "name":"Jingle Gift",
      "splashImageUrl":"https://xmas-tree-opal.vercel.app/icon.svg",
      "splashBackgroundColor":"#0a1a0a"
    }
  }
}' />
```

确认：
- [ ] preview.svg 存在且可访问
- [ ] icon.svg 存在且可访问
- [ ] 域名 xmas-tree-opal.vercel.app 正确

### 4. 测试流程

#### A. 本地测试API端点
```bash
# 测试用户搜索
curl "https://xmas-tree-opal.vercel.app/api/neynar?action=search&q=vitalik&limit=1"

# 测试用户信息
curl "https://xmas-tree-opal.vercel.app/api/neynar?action=user&fid=5650"

# 测试邮票资格
curl "https://xmas-tree-opal.vercel.app/api/neynar?action=check_stamps&fid=5650"

# 测试Warplet检查
curl "https://xmas-tree-opal.vercel.app/api/warplet?fid=5650"
```

#### B. 在Farcaster客户端测试
1. 使用 Warpcast (https://warpcast.com/) 或其他Farcaster客户端
2. 发送cast包含你的Mini App链接
3. 点击Mini App按钮测试启动
4. 验证：
   - [ ] SDK能正确获取用户信息（currentUser）
   - [ ] 用户搜索功能正常
   - [ ] 邮票资格检查正常
   - [ ] 礼物发送功能正常

#### C. 调试模式
在浏览器控制台检查：
```javascript
// 应该看到：
"Farcaster Mini App ready"
console.log(window.farcasterSDK)
console.log(currentUser) // 在Mini App环境中
```

### 5. 发布准备

#### 在Farcaster发布你的Mini App：
1. 确保所有API端点测试通过
2. 在Warpcast发布一个cast介绍你的Mini App
3. 包含链接：https://xmas-tree-opal.vercel.app
4. Mini App按钮应该自动显示

#### 示例cast：
```
🎄 Jingle Gift - Send Christmas gifts on Farcaster!

✨ Features:
- 3D interactive Christmas tree
- Send gifts to Farcaster friends
- Free stamps for eligible users
- AI-generated postcards

Try it now! 🎁
```

### 6. 监控和优化

部署后监控：
- Vercel Analytics: https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/analytics
- Vercel Logs: https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/logs
- 检查API调用成功率
- 监控错误日志

### 7. 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| Mini App按钮不显示 | 元数据格式错误 | 验证JSON格式，检查图片链接 |
| 用户信息获取失败 | 未在Mini App环境 | 在Farcaster客户端中测试 |
| API调用失败 | 环境变量未配置 | 检查Vercel环境变量 |
| Warplet检测不准确 | 缺少API key | 添加ALCHEMY_API_KEY |

## 📚 参考文档
- Farcaster Mini Apps: https://miniapps.farcaster.xyz/
- Neynar API: https://docs.neynar.com/
- Mini App SDK: https://github.com/farcasterxyz/miniapp-sdk
- Vercel部署: https://vercel.com/docs

## 🚀 快速命令

```bash
# 推送代码到Git
git add .
git commit -m "Ready for Farcaster Mini App deployment"
git push origin master

# Vercel会自动重新部署

# 检查部署状态
# 访问: https://vercel.com/misas-projects-f9fe1ec5/xmas-tree/deployments
```
