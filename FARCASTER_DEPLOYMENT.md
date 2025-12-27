# Farcaster Mini App 部署指南

## ✅ 当前配置状态

### 1. **Meta 标签配置（已完成）**

```html
<!-- Open Graph -->
<meta property="og:title" content="Jingle Gift">
<meta property="og:description" content="Interactive 3D Christmas Tree with Music">
<meta property="og:image" content="https://xmas-tree-opal.vercel.app/preview.svg">

<!-- Farcaster Mini App -->
<meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://xmas-tree-opal.vercel.app/preview.svg","button":{"title":"🎁 Open","action":{"type":"launch_frame","name":"Jingle Gift","splashImageUrl":"https://xmas-tree-opal.vercel.app/icon.svg","splashBackgroundColor":"#0a1a0a"}}}' />
```

### 2. **Vercel 部署（已完成）**

- ✅ 域名：`xmas-tree-opal.vercel.app`
- ✅ GitHub 自动部署已配置
- ✅ 环境变量已设置（Gemini API, Neynar API, Upstash KV）

### 3. **代码清理（已完成）**

- ✅ 移除所有测试代码
- ✅ 移除所有调试日志
- ✅ 生产模式启用

---

## 📋 Farcaster Mini App 部署步骤

### **第一步：验证部署环境**

1. **打开 Vercel Dashboard**
   - 检查最新部署状态：`b778e29 - Production: Remove all test code...`
   - 确认状态为 **Ready** ✅

2. **验证应用可访问**
   - 访问：https://xmas-tree-opal.vercel.app
   - 确认页面正常加载
   - 检查控制台无错误

---

### **第二步：在 Warpcast 中测试**

#### **方法 A：通过直接链接测试**

1. **发送测试 Cast（私密或草稿）**
   ```
   🎄 Testing my Christmas Gift Mini App
   
   https://xmas-tree-opal.vercel.app
   ```

2. **在 Warpcast 中查看**
   - 链接应该显示为 **Mini App 卡片**
   - 卡片应该显示 `preview.svg` 图片
   - 按钮文字：**🎁 Open**

3. **点击 Open 按钮**
   - 应该在 WebView 中打开应用
   - 检查 SDK 是否正确初始化
   - 检查用户信息是否正确获取

#### **方法 B：使用 Warpcast 的 Frame Validator**

1. **访问 Frame Validator**
   - URL: https://warpcast.com/~/developers/frames

2. **输入您的 URL**
   - `https://xmas-tree-opal.vercel.app`

3. **验证 Meta 标签**
   - 检查 `fc:miniapp` 是否正确解析
   - 检查图片预览是否正常

---

### **第三步：正式发布**

#### **1. 创建发布 Cast**

建议文案：

```
🎄 Jingle Gift - Christmas on Farcaster! 🎁

Send AI-generated Christmas postcards to your friends!

✨ Features:
• AI personalized greetings
• Beautiful vintage postcard design
• Collectible stamps (Neynar, Farcaster, Warplet, Based)
• Plaza gifts for community

Try it now! 👇
https://xmas-tree-opal.vercel.app

#Farcaster #Christmas #MiniApp
```

#### **2. 发布建议**

- **时间**：选择 Farcaster 活跃时段（美国时间白天）
- **频道**：发布到 `/miniapps` 或 `/christmas` 频道
- **互动**：准备回复用户问题和反馈

#### **3. 监控指标**

部署后关注：
- Vercel Analytics（流量）
- Vercel Logs（错误）
- 用户反馈（评论/回复）

---

## 🔧 Farcaster Mini App 核心规则

### **1. Meta 标签要求**

✅ **必需标签：**
```html
<meta name="fc:miniapp" content='...' />
```

✅ **推荐标签：**
```html
<meta property="og:title" content="..." />
<meta property="og:image" content="..." />
<meta property="og:description" content="..." />
```

### **2. SDK 初始化**

```javascript
import('https://esm.sh/@farcaster/miniapp-sdk').then(async ({ sdk }) => {
    sdk.actions.ready(); // 必须调用！
    const context = await sdk.context;
    const user = context.user; // 获取用户信息
});
```

### **3. 用户信息获取**

```javascript
const user = {
    fid: context.user.fid,           // Farcaster ID
    username: context.user.username, // 用户名
    displayName: context.user.displayName,
    pfpUrl: context.user.pfpUrl     // 头像
};
```

### **4. 限制和约束**

⚠️ **不支持：**
- 不能使用 `alert()` / `confirm()` / `prompt()`（会被沙箱阻止）
- 需要用自定义 Modal 替代

⚠️ **性能要求：**
- 首屏加载 < 3 秒
- 响应式设计（支持移动端）

---

## 🐛 常见问题排查

### **问题 1：Mini App 不显示**

**检查：**
1. `fc:miniapp` meta 标签是否正确
2. `imageUrl` 图片是否可访问
3. JSON 格式是否正确（无语法错误）

**解决：**
```bash
curl -I https://xmas-tree-opal.vercel.app/preview.svg
# 应该返回 200 OK
```

### **问题 2：SDK Context 为 undefined**

**原因：**
- SDK 还未完全加载
- 需要 `await sdk.context`

**解决：**
```javascript
const context = await sdk.context; // 必须 await
```

### **问题 3：用户信息获取失败**

**检查：**
1. 是否在 Farcaster 客户端中打开
2. SDK 是否调用了 `ready()`
3. 是否使用了 demo fallback

**当前实现：**
```javascript
// 1 秒延迟 + demo user fallback
if (!window.currentUser?.fid) {
    await new Promise(r => setTimeout(r, 1000));
    // 如果还是没有，使用 demo user
}
```

---

## 📊 部署后监控

### **1. Vercel Analytics**
- 访问：https://vercel.com/misas-projects-f9fe1ec5/xmas-tree
- 查看：
  - 访问量
  - 地理分布
  - 设备类型

### **2. Vercel Logs**
- 访问：Deployment → Logs
- 查找：
  - API 错误
  - 函数超时
  - 用户报错

### **3. 用户反馈**
- Warpcast 评论
- GitHub Issues
- 社区反馈

---

## 🚀 优化建议（部署后）

### **短期优化：**
1. 修复多选邮票 bug
2. 优化 SDK 用户获取（移除 demo fallback）
3. 添加错误上报（Sentry）

### **长期优化：**
1. 性能优化（减少首屏加载时间）
2. 添加云存储（Upstash Redis 已配置但未使用）
3. 社交分享功能增强
4. 用户数据分析

---

## ✅ 部署检查清单

- [ ] Vercel 最新部署状态 = Ready
- [ ] 访问 URL 正常加载
- [ ] 在 Warpcast 中预览 Mini App 卡片
- [ ] 点击 Open 按钮能正常打开
- [ ] SDK 用户信息正确获取
- [ ] 邮票系统正常工作
- [ ] AI 生图功能正常
- [ ] 发送明信片功能正常
- [ ] Plaza 礼物功能正常
- [ ] 无控制台错误
- [ ] 正式发布 Cast

---

## 📞 支持和帮助

**Farcaster 开发者资源：**
- 文档：https://docs.farcaster.xyz
- SDK：https://github.com/farcaster/miniapp-sdk
- 社区：Warpcast `/fc-dev` 频道

**本项目问题：**
- GitHub: https://github.com/0xPanty/XmasTree
- 作者：@0xPanty on Warpcast
