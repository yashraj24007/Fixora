# 🚀 Fixora Deployment Guide

## Current Status
✅ **Frontend**: Deployed on Vercel at `fixora-seven.vercel.app`  
⚠️ **Backend**: Needs to be deployed for Local Model feature to work

---

## 🎯 Complete Deployment Solution

Your Fixora app has **2 modes**:
1. **RAG Mode** (AI with documents) - Works without backend, uses Groq API directly from browser
2. **Local Model** (Dataset-based diagnosis) - **REQUIRES BACKEND SERVER**

### Current Issue
- When you run the app locally, it tries to start backend server → opens CMD windows
- Your hosted frontend at `fixora-seven.vercel.app` needs a hosted backend

---

## 📋 Step-by-Step: Deploy Backend to Render (FREE)

### Why Render?
- ✅ Free tier available
- ✅ Supports Node.js + Python
- ✅ Auto-deploys from GitHub
- ✅ No credit card required

### Steps:

#### 1. **Sign up for Render**
   - Go to: https://render.com/
   - Click "Get Started for Free"
   - Sign in with your GitHub account

#### 2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `yashraj24007/Fixora`
   - Configure:
     ```
     Name: fixora-backend
     Region: Choose closest to you
     Branch: main
     Root Directory: (leave empty)
     Runtime: Node
     Build Command: npm install && npm run build:server
     Start Command: npm run start:server
     ```

#### 3. **Add Environment Variables in Render Dashboard**
   ```
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   FRONTEND_URL=https://fixora-seven.vercel.app
   NODE_ENV=production
   ```

#### 4. **Install Python on Render**
   Create `render.yaml` (already created below)

#### 5. **Get Your Backend URL**
   After deployment, Render will give you a URL like:
   ```
   https://fixora-backend.onrender.com
   ```

#### 6. **Update Vercel Environment Variables**
   - Go to: https://vercel.com/yashraj24007/fixora-seven/settings/environment-variables
   - Update/Add:
     ```
     VITE_BACKEND_URL=https://fixora-backend.onrender.com/api/chat
     ```
   - Click "Save"
   - Redeploy your frontend

---

## 🔧 Alternative: Deploy Backend to Railway

### Steps:
1. Go to https://railway.app/
2. "New Project" → "Deploy from GitHub repo"
3. Select `yashraj24007/Fixora`
4. Add environment variables (same as Render above)
5. Railway will auto-detect Node.js and deploy
6. Get your URL: `https://fixora-backend.up.railway.app`
7. Update Vercel env variable

---

## 🛠️ For Local Development (Stop CMD from Opening)

### Current Issue:
Your scripts were manually starting servers which opened CMD windows.

### Solution:
**Just run ONE command in VS Code terminal:**
```bash
npm run dev:all
```

This starts both frontend and backend together in one terminal - no extra CMD windows!

---

## 📝 Environment Variables Checklist

### Vercel (Frontend) - Add these in Vercel Dashboard:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_AI_API_KEY`
- [ ] `VITE_AI_MODEL`
- [ ] `VITE_AI_API_ENDPOINT`
- [ ] `VITE_BACKEND_URL` ← **Update this with your Render/Railway URL**
- [ ] `HUGGINGFACE_API_KEY`

### Render/Railway (Backend):
- [ ] `PORT=3001`
- [ ] `GROQ_API_KEY`
- [ ] `FRONTEND_URL=https://fixora-seven.vercel.app`
- [ ] `NODE_ENV=production`

---

## ✅ Verification

After deployment:

1. **Test RAG Mode** (should already work):
   - Go to https://fixora-seven.vercel.app
   - Upload a PDF
   - Ask questions → Should work ✅

2. **Test Local Model** (after backend deployment):
   - Toggle to "Local Model" mode
   - Ask: "my brakes are making noise"
   - Should get instant response from dataset ✅

---

## 🐛 Troubleshooting

### "Failed to fetch" error on production
- ✅ Check Vercel env variables are set
- ✅ Check backend is deployed and running
- ✅ Check VITE_BACKEND_URL points to correct backend URL
- ✅ Check backend CORS allows your Vercel domain

### CMD windows keep opening locally
- ❌ Don't run `npm run dev:server` manually
- ✅ Use `npm run dev:all` instead (runs both together)
- ✅ Or just use `npm run dev` for frontend only (RAG mode will work)

---

## 🎉 Quick Deploy Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy frontend (if using Vercel CLI)
vercel --prod

# Deploy backend to Render
# (Use Render Dashboard - it's easier)
```

---

## 📞 Support

If you need help:
1. Check backend logs in Render/Railway dashboard
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test backend API directly: `https://your-backend.onrender.com/api/local-model`

---

**Your Next Steps:**
1. ⬜ Deploy backend to Render (15 minutes)
2. ⬜ Update Vercel env variable with backend URL
3. ⬜ Test both modes on production site
4. ⬜ Enjoy your fully deployed Fixora! 🎉
