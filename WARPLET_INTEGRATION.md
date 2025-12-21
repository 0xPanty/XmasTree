# Warplet NFT Integration Guide

## 概述
为Warplet NFT持有者提供免费邮票特权。

## 技术方案

### 1. 获取用户的Farcaster FID
```javascript
const userFid = currentUser.fid;
```

### 2. 调用API检查Warplet持有情况
```javascript
const response = await fetch(`/api/neynar?action=check_warplet&fid=${userFid}`);
const data = await response.json();

if (data.holdsWarplet) {
    // 显示免费Warplet邮票选项
    showWarpletStamp();
} else {
    // 显示锁定状态
    showLockedWarpletStamp();
}
```

### 3. 需要配置的信息

#### A. Warplet合约地址（Base链）
需要获取实际的Warplet NFT合约地址并替换代码中的 `0x...`

你可以：
1. 访问 https://basescan.org
2. 搜索 "Warplet"
3. 找到NFT合约地址

#### B. Alchemy API Key（推荐使用）
1. 访问 https://www.alchemy.com
2. 创建免费账户
3. 创建Base Mainnet App
4. 复制API Key
5. 添加到Vercel环境变量：
   ```
   ALCHEMY_API_KEY=your_key_here
   ```

**或者使用替代方案：**

#### C. 使用Moralis API（替代方案）
```javascript
// Moralis API endpoint
const url = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=base&format=decimal&token_addresses[]=${WARPLET_CONTRACT}`;
const response = await fetch(url, {
    headers: {
        'X-API-Key': MORALIS_API_KEY
    }
});
```

#### D. 使用Chainbase API（替代方案）
```javascript
const url = `https://api.chainbase.online/v1/account/nfts?chain_id=8453&address=${address}&contract_address=${WARPLET_CONTRACT}`;
const response = await fetch(url, {
    headers: {
        'x-api-key': CHAINBASE_API_KEY
    }
});
```

## 工作流程

```
用户打开邮票选择界面
    ↓
前端获取 currentUser.fid
    ↓
调用 /api/neynar?action=check_warplet&fid=xxx
    ↓
后端：
  1. 从Neynar获取用户的verified_addresses
  2. 遍历每个地址，查询Base链上的NFT
  3. 检查是否持有Warplet
    ↓
返回 { holdsWarplet: true/false }
    ↓
前端根据结果显示：
  - true：显示免费Warplet邮票
  - false：显示锁定状态 + "Get Warplet"链接
```

## UI设计建议

### 持有Warplet时：
```
┌────────────────────────────────┐
│ 🎉 Warplet Holder Exclusive!  │
├────────────────────────────────┤
│ ┌──────────────┐               │
│ │  WARPLET     │  ✨ FREE      │
│ │  #W12345     │               │
│ └──────────────┘               │
│ ✅ Verified holder             │
└────────────────────────────────┘
```

### 不持有Warplet时：
```
┌────────────────────────────────┐
│ 🔒 Warplet Holder Exclusive   │
├────────────────────────────────┤
│ ┌──────────────┐               │
│ │  WARPLET     │  FREE for     │
│ │     🔒       │  holders      │
│ └──────────────┘               │
│ [Get Warplet NFT →]            │
└────────────────────────────────┘
```

## 性能优化

### 缓存策略
```javascript
// 缓存检查结果5分钟
const cacheKey = `warplet_${userFid}`;
const cached = cache.get(cacheKey);
if (cached) return cached;

// 查询后缓存
const result = await checkWarplet(fid);
cache.set(cacheKey, result, 300); // 5分钟
```

## 成本估算

### Alchemy免费额度：
- 每月300M计算单位
- 每次NFT查询约消耗10个单位
- 可支持约3000万次查询/月

### 如果超出免费额度：
- Growth计划：$49/月
- 或使用多个API provider分散流量

## 待办事项

- [ ] 获取Warplet合约地址
- [ ] 申请Alchemy API Key
- [ ] 在Vercel配置环境变量
- [ ] 测试API端点
- [ ] 实现前端UI
- [ ] 添加缓存机制
- [ ] 错误处理和日志
