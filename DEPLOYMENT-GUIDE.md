# Travel Planner App - Deployment Guide

## App Overview
AI Travel Companion - A full-stack travel planning application with React/Next.js frontend and Node.js/Express backend.

## Current Status
✅ **Fully functional locally**
✅ **All features working**: Authentication, itineraries, payments, packing lists
✅ **Mobile responsive**
✅ **Database**: SQLite with Prisma ORM
✅ **Payment processing**: Stripe integration
✅ **External APIs**: Google Places API

## Architecture
- **Frontend**: Next.js 14 (React)
- **Backend**: Node.js/Express
- **Database**: SQLite (dev) - needs PostgreSQL for production
- **Payments**: Stripe
- **External APIs**: Google Places
- **Deployment**: Needs cloud deployment (Vercel + Cloud Run recommended)

## Local URLs (Currently Working)
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Mobile: http://192.168.1.22:3000
- Test Login: test@example.com / testpass

## Required Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@host:5432/database_name"
JWT_SECRET="secure-jwt-secret-key"
GOOGLE_PLACES_API_KEY="AIzaSyBFzrtscHguwSjI3mN9H8J0dgvXpPUMwQI"
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
CORS_ORIGIN="*"
NODE_ENV="production"
PORT="8080"
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL="https://your-backend-url"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SBSs0ATWfhaVzs6NvsglQAM8659I2VYa429ads1ahpyenHhbyNGPm8Wo8eRESzHFZyXBvSU4ygx3Z064s8p5DuK00FoWXtpqS"
```

## Deployment Requirements

### 1. Database Setup
- **Current**: SQLite (local file)
- **Production**: PostgreSQL or similar cloud database
- **Migration**: Use Prisma migrations
- **Commands**:
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

### 2. Backend Deployment
- **Platform**: Google Cloud Run, Railway, or similar container platform
- **Docker**: Dockerfile already configured
- **Port**: Must use PORT environment variable (8080)
- **Health check**: `/health` endpoint available

### 3. Frontend Deployment
- **Platform**: Vercel (recommended for Next.js)
- **Build**: Standard Next.js build process
- **Environment**: Must set NEXT_PUBLIC_API_URL to backend URL

### 4. Domain & SSL
- Frontend needs custom domain for App Store
- Backend needs HTTPS
- CORS configuration for frontend domain

## Key Files Structure
```
travel-planner/
├── backend/
│   ├── src/
│   │   ├── server.js (main server)
│   │   └── routes/ (API routes)
│   ├── prisma/
│   │   └── schema.prisma (database schema)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── pages/ (Next.js pages)
│   ├── components/ (React components)
│   ├── contexts/ (Auth context)
│   └── package.json
└── start-servers.bat (local development)
```

## Critical Features to Test
1. **Authentication**: Login/register
2. **Itineraries**: Create/view/edit travel plans
3. **Payments**: Stripe integration
4. **Mobile**: Responsive design
5. **API Integration**: Google Places
6. **CORS**: Cross-origin requests

## Known Issues to Resolve
1. **Database**: SQLite not suitable for production
2. **CORS**: May need specific domain configuration
3. **Environment Variables**: Some may be missing in production
4. **Serverless Functions**: Backend may need adaptation for serverless

## Success Criteria
- [ ] Frontend accessible via HTTPS custom domain
- [ ] Backend API responding to all routes
- [ ] Login/authentication working
- [ ] Database connected and functional
- [ ] Stripe payments processing
- [ ] Mobile access working
- [ ] All components loading without errors
- [ ] Ready for App Store submission

## Contact & Credentials
- Google Cloud Project: travel-planner-app-2024
- Vercel Account: puupows-projects
- Stripe: Test mode keys provided

## Local Development (Working State)
To run locally (currently working):
```bash
cd travel-planner
./start-servers.bat
```
Then access:
- http://localhost:3000 (desktop)
- http://192.168.1.22:3000 (mobile)

## Estimated Deployment Time
- Simple cloud deployment: 2-4 hours
- With database migration: 4-8 hours
- With custom domain/SSL: 1-2 additional hours
- Testing and debugging: 2-4 hours

**Total estimated time: 8-16 hours for complete deployment**