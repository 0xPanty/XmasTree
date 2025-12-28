# 🌐 IPFS Integration Setup Guide

## What This Does

Recipients can now **truly receive your postcards**! When you send a gift, it's uploaded to IPFS (decentralized storage) and the recipient gets a permanent link that works even if they don't have your browser's localStorage.

---

## 📋 Setup Steps (5 minutes)

### Step 1: Get Pinata API Key

1. Go to https://app.pinata.cloud/
2. Click **Sign Up** (or Login if you have an account)
3. After login, go to **API Keys** in the left sidebar
4. Click **+ New Key**
5. Name it: `ChristmasTree`
6. Enable **pinFileToIPFS** and **pinJSONToIPFS**
7. Click **Create Key**
8. **Copy the JWT** (it looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **Important**: Save the JWT now - you can't see it again!

---

### Step 2: Add to Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your **XmasTree** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add**
5. Enter:
   - **Name**: `PINATA_JWT`
   - **Value**: (paste your JWT)
   - **Environment**: Production, Preview, Development (check all 3)
6. Click **Save**

---

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. ✅ Done!

---

## 🎉 How It Works

### Before (localStorage only):
```
You: Generate postcard
You: Click "Send Gift"
You: Copy link and send to friend
Friend: Opens link → ❌ Can't see postcard (no data in their browser)
```

### After (with IPFS):
```
You: Generate postcard
You: Click "Send Gift" → Auto-uploads to IPFS
You: Copy link: https://yourapp.com/?ipfs=Qm...
Friend: Opens link → ✅ Loads from IPFS → Sees your beautiful postcard! 🎄
```

---

## 💰 Pinata Free Tier Limits

- 📦 **1 GB storage** (enough for ~2000 postcards)
- 🌐 **10 GB bandwidth/month** 
- 📁 **500 files**
- 🔄 **10,000 requests/month**

This is **more than enough** for your Christmas project! 🎉

---

## 🧪 Test It

After setup:

1. Generate a postcard
2. Click "Send Gift"
3. Check console logs:
   ```
   📤 Uploading gift to IPFS...
   ✅ Uploaded to IPFS: QmXxxx...
   ```
4. Copy the link (should contain `?ipfs=...`)
5. Open in **incognito mode** → Should still work! 🎉

---

## 🔍 Troubleshooting

### "Failed to upload to IPFS"
- Check that `PINATA_JWT` is set correctly in Vercel
- Make sure you redeployed after adding the variable
- Check `/api/pinata` exists in your deployment

### Link shows "Gift not found"
- IPFS can take 5-10 seconds to propagate
- Wait a moment and refresh
- Check console for error messages

### Fallback behavior
If IPFS upload fails, the app automatically falls back to localStorage (old behavior).

---

## 📊 Monitor Usage

1. Go to https://app.pinata.cloud/
2. Click **Usage** to see:
   - Storage used
   - Bandwidth used
   - Number of files

You'll get email alerts if you're close to limits.

---

## 🎯 What's Next?

Now your friends can:
- ✅ Click your link and see the postcard
- ✅ View it anytime (permanent IPFS storage)
- ✅ Share it with others
- ✅ Download the images

The postcard lives on IPFS forever! 🌟
