# Farcaster Mini App 部署必须修复的问题

## ✅ 已完成
- [x] `sdk.actions.ready()` 已正确调用
- [x] Meta 标签 `fc:miniapp` 已配置

## ⚠️ 必须立即修复

### 1. 创建 Manifest 文件（必需）

**文件位置：** `/.well-known/farcaster.json`

**步骤：**

#### 1.1 创建目录和文件

```bash
mkdir -p .well-known
touch .well-known/farcaster.json
```

#### 1.2 添加未签名的 Manifest（先部署）

```json
{
  "miniapp": {
    "version": "1",
    "name": "Jingle Gift",
    "iconUrl": "https://xmas-tree-opal.vercel.app/icon.svg",
    "homeUrl": "https://xmas-tree-opal.vercel.app",
    "imageUrl": "https://xmas-tree-opal.vercel.app/preview.svg",
    "buttonTitle": "🎁 Open",
    "splashImageUrl": "https://xmas-tree-opal.vercel.app/icon.svg",
    "splashBackgroundColor": "#0a1a0a"
  }
}
```

#### 1.3 部署后签名

1. 访问：https://farcaster.xyz/~/developers/mini-apps/manifest?domain=xmas-tree-opal.vercel.app
2. 复制生成的 `accountAssociation` 对象
3. 更新 manifest 文件：

```json
{
  "accountAssociation": {
    "header": "复制的 header",
    "payload": "复制的 payload",
    "signature": "复制的 signature"
  },
  "miniapp": {
    "version": "1",
    "name": "Jingle Gift",
    "iconUrl": "https://xmas-tree-opal.vercel.app/icon.svg",
    "homeUrl": "https://xmas-tree-opal.vercel.app",
    "imageUrl": "https://xmas-tree-opal.vercel.app/preview.svg",
    "buttonTitle": "🎁 Open",
    "splashImageUrl": "https://xmas-tree-opal.vercel.app/icon.svg",
    "splashBackgroundColor": "#0a1a0a"
  }
}
```

#### 1.4 配置 Vercel 重定向（如果需要）

在 `vercel.json` 中添加：

```json
{
  "redirects": [
    {
      "source": "/.well-known/farcaster.json",
      "destination": "/.well-known/farcaster.json"
    }
  ]
}
```

---

### 2. 验证图片尺寸

#### 2.1 检查 preview.svg（必须 3:2 比例）

```bash
# 查看 SVG 尺寸
grep -E "width=|height=|viewBox=" preview.svg
```

**要求：** 宽高比必须是 3:2（例如：1200x800, 900x600）

#### 2.2 检查 icon.svg（推荐 200x200px）

```bash
grep -E "width=|height=|viewBox=" icon.svg
```

**要求：** 建议 200x200px 正方形

---

### 3. 启用开发者模式

1. 访问：https://farcaster.xyz/~/settings/developer-tools
2. 开启 "Developer Mode"
3. 桌面左侧会出现开发者工具

---

### 4. 测试流程

#### 4.1 验证 Manifest 可访问

```bash
curl -s https://xmas-tree-opal.vercel.app/.well-known/farcaster.json
```

**期望输出：** 返回 JSON manifest

#### 4.2 使用预览工具测试

URL 格式：
```
https://farcaster.xyz/~/developers/mini-apps/preview?url=https://xmas-tree-opal.vercel.app
```

**检查：**
- [ ] 应用能正常加载
- [ ] 没有无限 loading
- [ ] Splash screen 正确显示
- [ ] 内容正确显示

#### 4.3 在 Warpcast 测试

发送测试 Cast：
```
🎄 Testing https://xmas-tree-opal.vercel.app
```

**检查：**
- [ ] 链接显示为 Mini App 卡片
- [ ] 预览图正确显示
- [ ] "🎁 Open" 按钮出现
- [ ] 点击能打开应用

---

## 🐛 常见问题排查

### 问题 1：无限 loading screen

**原因：** 没有调用 `sdk.actions.ready()`

**解决：** ✅ 已修复（在 index.html 第 2785 行）

### 问题 2：Manifest 404

**原因：** 文件不存在或路径错误

**解决：**
1. 确认文件在 `.well-known/farcaster.json`
2. 检查 Vercel 部署是否包含该文件
3. 测试访问 URL

### 问题 3：SDK Context 为 undefined

**原因：** SDK 未完全加载

**解决：** ✅ 已修复（使用 `await sdk.context`）

### 问题 4：图片不显示

**原因：** 图片 URL 错误或尺寸不对

**解决：**
1. 验证图片可访问
2. 检查尺寸是否符合要求
3. 确认 CORS 设置

---

## 📝 部署检查清单

### 部署前：
- [ ] 创建 `.well-known/farcaster.json` 文件
- [ ] 验证图片尺寸正确
- [ ] 确认 `sdk.actions.ready()` 已调用
- [ ] 测试本地构建无错误

### 部署后：
- [ ] 访问 manifest URL 返回 200
- [ ] 使用预览工具测试
- [ ] 在 Warpcast 测试嵌入卡片
- [ ] 签名 accountAssociation
- [ ] 重新部署签名后的 manifest
- [ ] 最终测试完整流程

### 正式发布前：
- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] 用户体验流畅
- [ ] 启用开发者模式
- [ ] 发布正式 Cast

---

## 🚀 快速执行命令

```bash
# 1. 创建 manifest 文件
mkdir -p .well-known
echo '{"miniapp":{"version":"1","name":"Jingle Gift","iconUrl":"https://xmas-tree-opal.vercel.app/icon.svg","homeUrl":"https://xmas-tree-opal.vercel.app","imageUrl":"https://xmas-tree-opal.vercel.app/preview.svg","buttonTitle":"🎁 Open","splashImageUrl":"https://xmas-tree-opal.vercel.app/icon.svg","splashBackgroundColor":"#0a1a0a"}}' > .well-known/farcaster.json

# 2. 添加到 git
git add .well-known/farcaster.json
git commit -m "Add: Farcaster manifest for Mini App

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

# 3. 推送
git push origin master

# 4. 等待部署，然后访问签名工具
# https://farcaster.xyz/~/developers/mini-apps/manifest?domain=xmas-tree-opal.vercel.app
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看文档：https://miniapps.farcaster.xyz
2. 联系 Farcaster 团队：@pirosb3, @linda, @deodad on Warpcast
3. 查看 GitHub Issues：https://github.com/farcasterxyz/miniapps
