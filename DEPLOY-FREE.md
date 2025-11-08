# 🚀 FREE Deployment Guide - Travel Planner App

This guide will deploy your app using **100% FREE** services with no credit card required.

## 📋 Prerequisites

- GitHub account (free)
- Railway.app account (free tier: 512MB RAM, $5 credit/month)
- Vercel account (free tier: unlimited)

---

## 🎯 Deployment Strategy

| Component | Service | Cost |
|-----------|---------|------|
| **Frontend** | Vercel | FREE ✅ |
| **Backend API** | Railway.app | FREE ✅ |
| **Database** | Railway PostgreSQL | FREE ✅ |

---

## 📦 Step 1: Prepare Your Code

### 1.1 Initialize Git Repository (if not already done)

```bash
cd C:\Users\dspen\projects\travel-planner
git init
git add .
git commit -m "Initial commit for deployment"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `travel-planner`
3. Don't initialize with README (we already have code)
4. Copy the repository URL

### 1.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/travel-planner.git
git branch -M main
git push -u origin main
```

---

## 🚂 Step 2: Deploy Backend on Railway

### 2.1 Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub (it's free, no credit card needed)
3. You get $5/month free credit (enough for this app)

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select your `travel-planner` repository
5. Railway will detect it's a monorepo

### 2.3 Configure Backend Service

1. Click **"Add Service"** → **"GitHub Repo"**
2. Select `travel-planner` repository
3. Set the **Root Directory** to: `backend`
4. Railway will auto-detect Node.js

### 2.4 Add PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a free PostgreSQL database
4. Copy the **DATABASE_URL** (Railway will auto-inject this)

### 2.5 Configure Environment Variables

In Railway backend service settings, add these variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=travel-planner-super-secret-key-2024-change-this
OPENAI_API_KEY=
GOOGLE_PLACES_API_KEY=AIzaSyBFzrtscHguwSjI3mN9H8J0dgvXpPUMwQI
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
CORS_ORIGIN=*
```

**Note:** Railway will automatically provide `DATABASE_URL` from the PostgreSQL database.

### 2.6 Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Wait for build to complete (~2-3 minutes)
3. Copy your backend URL: `https://your-backend.railway.app`
4. Click **"Generate Domain"** to get a public URL

### 2.7 Update CORS After Frontend Deploy

After deploying frontend (Step 3), come back and update:

```env
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔷 Step 3: Deploy Frontend on Vercel

### 3.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (100% free, unlimited)

### 3.2 Import Project

1. Click **"Add New"** → **"Project"**
2. Import your `travel-planner` GitHub repository
3. Vercel will detect Next.js automatically

### 3.3 Configure Build Settings

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next` (auto-filled)

### 3.4 Add Environment Variables

In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

**Important:** Replace `https://your-backend.railway.app` with your actual Railway backend URL.

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for build
3. Your app will be live at: `https://your-app.vercel.app`

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend

Visit: `https://your-backend.railway.app/health`

You should see: `{"status":"ok"}`

### 4.2 Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Try to register a new account
3. Login and create a test trip

### 4.3 Test Database

In Railway dashboard:
1. Click on PostgreSQL service
2. Click **"Data"** tab
3. You should see your `User` table populated

---

## 🔄 Step 5: Enable Auto-Deployment

Both Vercel and Railway support automatic deployments:

### For Backend (Railway):
- Push to `main` branch → auto-deploys backend
- Railway rebuilds and redeploys automatically

### For Frontend (Vercel):
- Push to `main` branch → auto-deploys frontend
- Vercel rebuilds and redeploys automatically

```bash
# Make a change, then:
git add .
git commit -m "Update feature"
git push origin main
# Both services auto-deploy!
```

---

## 💰 Free Tier Limits

### Railway Free Tier:
- **$5/month credit** (resets monthly)
- **512MB RAM**
- **1GB Disk**
- **100GB Network**
- Perfect for this app! ✅

### Vercel Free Tier:
- **Unlimited deployments**
- **100GB bandwidth/month**
- **Serverless functions**
- More than enough! ✅

### Expected Monthly Usage:
- **Backend:** ~$2-3/month (well within free tier)
- **Frontend:** $0 (always free)
- **Total Cost:** **$0** 🎉

---

## 🐛 Troubleshooting

### Backend Not Starting

1. Check Railway logs: Click service → **"Deployments"** → **"View Logs"**
2. Ensure `DATABASE_URL` is set
3. Verify Prisma migrations ran: Look for `prisma db push` in logs

### Frontend Can't Reach Backend

1. Verify `NEXT_PUBLIC_API_URL` in Vercel env vars
2. Check Railway backend is running: Visit `/health` endpoint
3. Update CORS_ORIGIN in Railway to match Vercel domain

### Database Connection Failed

1. In Railway, click PostgreSQL service
2. Verify it's running (green status)
3. Check that backend service can see DATABASE_URL variable

### Build Failed

**Railway:**
```bash
# Check package.json scripts are correct
# Ensure prisma is in dependencies, not devDependencies
```

**Vercel:**
```bash
# Verify root directory is set to "frontend"
# Check build logs for specific error
```

---

## 🎉 Success!

Your app is now live and deployed for **FREE**! 

### Your Live URLs:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **Database:** Managed by Railway (PostgreSQL)

### Next Steps:
1. ✅ Test all features (auth, trips, bookings, payments)
2. ✅ Share your app URL with users
3. ✅ Monitor usage in Railway/Vercel dashboards
4. ✅ Set up custom domain (optional, costs ~$10/year for domain only)

---

## 📊 Monitoring Your App

### Railway Dashboard:
- View backend metrics, logs, database usage
- Monitor free credit consumption
- Access PostgreSQL data browser

### Vercel Dashboard:
- View deployment history
- Check analytics (visits, bandwidth)
- Access deployment logs

---

## 🔐 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** - Set in Railway/Vercel UI
3. **Generate strong JWT_SECRET** - Update in production
4. **Keep Stripe keys secure** - Test keys are fine for now
5. **Enable HTTPS** - Both services provide this automatically ✅

---

## 📞 Need Help?

If deployment fails or you encounter issues:

1. **Check logs first:**
   - Railway: Service → Deployments → View Logs
   - Vercel: Deployments → Click deployment → Function Logs

2. **Common fixes:**
   - Rebuild: Force redeploy in Railway/Vercel
   - Clear cache: Delete `.next` and `node_modules`
   - Check env vars: Ensure all required vars are set

3. **Railway Community:** https://railway.app/discord
4. **Vercel Community:** https://github.com/vercel/vercel/discussions

---

## 🎯 Summary Commands

```bash
# 1. Setup Git and push to GitHub
cd C:\Users\dspen\projects\travel-planner
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/travel-planner.git
git push -u origin main

# 2. Deploy backend on Railway (via web UI)
# - Connect GitHub repo
# - Set root directory: backend
# - Add PostgreSQL database
# - Configure environment variables

# 3. Deploy frontend on Vercel (via web UI)
# - Import GitHub repo
# - Set root directory: frontend
# - Add environment variables
# - Deploy!

# 4. Future updates (auto-deploy)
git add .
git commit -m "New feature"
git push origin main
# Done! Both services auto-deploy
```

---

**Congratulations! Your travel planner app is now live and accessible worldwide! 🌍✈️**
