# 🔐 Environment Setup Guide

## Single .env File Structure

Fixora now uses a **single `.env` file** for all environment configuration. No more confusion between `.env`, `.env.local`, or multiple files!

## 📁 File Structure

```
Fixora/
├── .env                 # ✅ YOUR ACTUAL SECRETS (git-ignored)
├── .env.example         # 📋 Template with placeholders
└── .gitignore           # 🔒 Protects .env from being committed
```

## 🚀 Quick Setup

### 1. **First Time Setup**
```bash
# Copy the example file
cp .env.example .env

# Open .env and add your API keys
```

### 2. **Required API Keys**

#### Supabase (Authentication & Database)
- Go to: https://app.supabase.com/
- Create/Select your project
- Get: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### Groq AI (Chat Completions)
- Go to: https://console.groq.com/
- Create FREE account
- Get: API key for `VITE_AI_API_KEY` and `GROQ_API_KEY`

#### Hugging Face (Embeddings)
- Go to: https://huggingface.co/settings/tokens
- Create FREE token
- Get: Token for `HUGGINGFACE_API_KEY`

## 📋 Environment Variables Explained

### Frontend Variables (VITE_ prefix)
These are **accessible in the browser** via `import.meta.env`:

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_AI_API_KEY=gsk_xxx...
VITE_AI_MODEL=llama-3.1-70b-versatile
VITE_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
VITE_BACKEND_URL=http://localhost:3001/api/chat
```

### Backend Variables (NO VITE_ prefix)
These are **only accessible on the server** via `process.env`:

```bash
GROQ_API_KEY=gsk_xxx...              # Server-side Groq API
HUGGINGFACE_API_KEY=hf_xxx...        # Server-side embeddings
PORT=3001                             # Backend server port
FRONTEND_URL=http://localhost:8080    # CORS configuration
```

## 🔒 Security Best Practices

### ✅ Safe to Expose (Frontend/VITE_ prefixed)
- `VITE_SUPABASE_URL` - Public project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (protected by Row Level Security)
- `VITE_AI_API_KEY` - Groq API key for client-side calls

### ❌ NEVER Expose (Backend only)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (if you add it)
- `GROQ_API_KEY` - Backend server API key
- `HUGGINGFACE_API_KEY` - Backend embeddings API key
- `DATABASE_URL` - Direct database connection (if you add it)

## 🛡️ Git Protection

Your `.env` file is **automatically protected** by `.gitignore`:

```gitignore
# Already in .gitignore:
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local
```

**Only `.env.example` is committed** to show the structure.

## 🔄 After Changing .env

If you modify `.env` while the dev server is running:

```bash
# Vite will auto-restart - you'll see:
.env changed, restarting server...
```

For backend changes:
```bash
# Restart backend manually:
Ctrl+C  (stop server)
npm run dev  (restart)
```

## 📝 Complete .env Template

```bash
# ==========================================
# FIXORA - Environment Configuration
# ==========================================

# SUPABASE
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GROQ AI
VITE_AI_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AI_MODEL=llama-3.1-70b-versatile
VITE_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# HUGGING FACE
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# BACKEND SERVER
VITE_BACKEND_URL=http://localhost:3001/api/chat
PORT=3001
FRONTEND_URL=http://localhost:8080
```

## ❓ Troubleshooting

### "Cannot find .env file"
```bash
# Make sure .env exists in project root:
ls .env

# If missing, copy from example:
cp .env.example .env
```

### "API key not working"
```bash
# Check for typos in .env
# Make sure no spaces around = sign:
GROQ_API_KEY=gsk_xxx  # ✅ Correct
GROQ_API_KEY = gsk_xxx  # ❌ Wrong (spaces)
```

### "Environment variable undefined"
```bash
# Frontend: Must use VITE_ prefix
import.meta.env.VITE_AI_API_KEY  # ✅ Works
import.meta.env.AI_API_KEY       # ❌ Undefined

# Backend: NO VITE_ prefix
process.env.GROQ_API_KEY  # ✅ Works
process.env.VITE_GROQ_API_KEY  # ❌ Undefined
```

## 🎯 Summary

- ✅ **One file**: `.env` for all secrets
- ✅ **Template**: `.env.example` for reference
- ✅ **Protected**: Git-ignored automatically
- ✅ **Frontend**: `VITE_` prefix required
- ✅ **Backend**: No `VITE_` prefix
- ✅ **Free**: All APIs have free tiers

---

**Need help?** Check the main README.md or open an issue! 🚀
