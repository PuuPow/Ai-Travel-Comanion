# Travel Planner - Vercel Deployment Guide

This guide will help you deploy your Travel Planner application to Vercel with a production database.

## Prerequisites

1. Vercel CLI installed (`npm i -g vercel`)
2. A Vercel account
3. A production database (PostgreSQL recommended)

## Step 1: Set Up Production Database

Choose one of these database providers:

### Option A: Railway (PostgreSQL) - Recommended
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection URL (looks like: `postgresql://username:password@containers-us-west-xxx.railway.app:xxxx/railway`)

### Option B: Supabase (PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: PlanetScale (MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Create a connection string

## Step 2: Deploy Backend to Vercel

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the backend:**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel:**
   Go to your Vercel dashboard → Your backend project → Settings → Environment Variables

   Add these variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-secure-jwt-secret-256-bit
   GOOGLE_PLACES_API_KEY=your-google-places-api-key
   OPENAI_API_KEY=your-openai-api-key (optional)
   ```

5. **Run database migration:**
   After setting DATABASE_URL, trigger a redeploy to run Prisma migrations:
   ```bash
   vercel --prod
   ```

## Step 3: Deploy Frontend to Vercel

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Update environment variables:**
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-vercel-url.vercel.app
   ```

3. **Deploy the frontend:**
   ```bash
   vercel --prod
   ```

## Step 4: Update CORS Configuration

After both deployments, update the backend's CORS configuration to include your frontend URL:

1. Go to Vercel dashboard → Backend project → Settings → Environment Variables
2. Add: `FRONTEND_URL=https://your-frontend-vercel-url.vercel.app`
3. Redeploy: `vercel --prod`

## Step 5: Test the Deployment

1. Visit your frontend URL
2. Test user registration and login
3. Create an itinerary and test AI suggestions
4. Verify Google Places integration works

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly formatted
- Check that your database allows connections from Vercel's IP ranges
- Verify database credentials are correct

### CORS Errors
- Ensure FRONTEND_URL is set in backend environment variables
- Check that both frontend and backend URLs are included in CORS config

### Function Timeouts
- Vercel has a 10-second limit for serverless functions
- AI generation might timeout with large requests
- Consider reducing the complexity of AI prompts if needed

## Custom Domain (Optional)

To set up a custom domain:

1. **Free options:**
   - Use Vercel's free subdomain: `your-app-name.vercel.app`
   - Get a free domain from Freenom (.tk, .ga, .cf, .ml)

2. **Configure domain:**
   - Go to Vercel dashboard → Your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
GOOGLE_PLACES_API_KEY=your-key
OPENAI_API_KEY=your-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## Cost Considerations

- Vercel: Free tier includes 100GB bandwidth, 6000 hours serverless functions
- Railway: $5/month for PostgreSQL database
- Supabase: Free tier includes 500MB database, 2 million API calls
- Google Places API: $5 per 1000 requests (usually very affordable for personal use)

Your app should run comfortably within free tiers for personal use!