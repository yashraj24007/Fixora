# Vercel Environment Variables Setup

## 🚨 IMPORTANT: Fix Deployment Error

The deployment error happens because `vercel.json` was trying to reference secrets that don't exist. I've fixed this by removing the `env` section from `vercel.json`.

## ✅ Setup Steps

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/yashraj24007/fixora-seven/settings/environment-variables

2. **Add These Environment Variables**

   Click "Add New" for each variable:

   ### Required Variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://lywkbvpqglgpibyrivha.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | _(Get from your `.env` file)_ | Production, Preview, Development |
   | `VITE_AI_API_KEY` | _(Get from your `.env` file - Groq API key)_ | Production, Preview, Development |
   | `VITE_AI_MODEL` | `llama-3.1-70b-versatile` | Production, Preview, Development |
   | `VITE_AI_API_ENDPOINT` | `https://api.groq.com/openai/v1/chat/completions` | Production, Preview, Development |

   ### Optional (for Local Model - needs backend deployment):

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_BACKEND_URL` | `http://localhost:3001` (or your deployed backend URL) | Production, Preview, Development |

3. **Redeploy**
   - After adding variables, go to: https://vercel.com/yashraj24007/fixora-seven
   - Click "Redeploy" on the latest deployment
   - Or just push a new commit to trigger automatic deployment

## 📝 How to Find Your Values

### Get Supabase Anon Key:
```bash
# Look in your .env file:
cat .env | grep VITE_SUPABASE_ANON_KEY
```

### Get Groq API Key:
```bash
# Look in your .env file:
cat .env | grep VITE_AI_API_KEY
```

## 🔍 Verify Setup

After deployment, check:
1. Visit https://fixora-seven.vercel.app
2. Open browser DevTools → Console
3. Should see no environment variable errors
4. Test AI chat functionality
5. Test offline mode (DevTools → Network → Offline checkbox)

## 🌐 PWA Offline Test

1. Visit https://fixora-seven.vercel.app
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Click "Offline" in DevTools Network tab
5. Reload page - it should work offline! 🎉
6. Click SOS button - GPS location should work
7. Test Local Model (if backend deployed)

## 🚀 Optional: Deploy Backend

To make Local Model work on production:

1. **Deploy to Render.com** (Free)
   - Create account at https://render.com
   - Connect GitHub repo
   - Deploy from `server` folder
   - Note the deployed URL (e.g., `https://fixora-backend.onrender.com`)

2. **Update Vercel Environment Variable**
   - Change `VITE_BACKEND_URL` to your Render URL
   - Redeploy

## ✅ Expected Result

After setup:
- ✅ Website loads at fixora-seven.vercel.app
- ✅ AI chat works (Groq/Supabase connected)
- ✅ PWA installs on mobile
- ✅ Works offline after first visit
- ✅ SOS emergency with GPS works offline
- ✅ Offline storage saves messages
- ⏳ Local Model (needs backend deployment)

## 🔧 Troubleshooting

**Still seeing errors?**
- Clear Vercel build cache: Settings → General → Clear Build Cache
- Check all env variable names are EXACT (case-sensitive)
- Make sure "Production" is checked for each variable
- Wait 2-3 minutes after adding variables before redeploying

**PWA not working?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check DevTools → Application → Service Workers for errors

**Local Model not working?**
- That's expected! Backend is not deployed yet
- Either deploy backend or use AI mode (Groq) instead
- SOS and offline features work without backend
