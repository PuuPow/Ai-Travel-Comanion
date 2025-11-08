# Developer Setup Instructions

## Quick Start (Local Development)
```bash
# Clone/download the project
cd travel-planner

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Start both servers (Windows)
cd ..
./start-servers.bat

# Or manually:
# Terminal 1: cd backend && npm start
# Terminal 2: cd frontend && npm run dev
```

## Test URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health
- Login: test@example.com / testpass

## Production Deployment Checklist

### 1. Database Migration
```bash
cd backend
# Update DATABASE_URL in .env to PostgreSQL
npx prisma migrate deploy
npx prisma generate
```

### 2. Backend Deployment (Docker)
```dockerfile
# Dockerfile already exists in backend/
docker build -t travel-planner-api .
docker run -p 8080:8080 travel-planner-api
```

### 3. Frontend Deployment
```bash
cd frontend
# Update .env.production with backend URL
npm run build
# Deploy to Vercel/Netlify
```

### 4. Environment Variables Setup

**Backend Production:**
- DATABASE_URL (PostgreSQL)
- JWT_SECRET (secure random string)
- GOOGLE_PLACES_API_KEY (provided)
- STRIPE_SECRET_KEY (provided)
- PORT=8080
- NODE_ENV=production

**Frontend Production:**
- NEXT_PUBLIC_API_URL (backend URL)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (provided)

### 5. Domain & SSL
- Set up custom domain for frontend
- Configure CORS with actual domain
- Update Stripe webhook URLs if needed

## Testing After Deployment
1. Frontend loads without errors
2. Login/register works
3. Create new itinerary
4. Stripe payment flow
5. Mobile responsive design
6. All API endpoints responding

## Common Issues & Solutions
- **CORS errors**: Update CORS_ORIGIN in backend
- **Database connection**: Check DATABASE_URL format
- **Stripe errors**: Verify publishable/secret key pair
- **Build errors**: Check node version (16+)

## Support Files Included
- `DEPLOYMENT-GUIDE.md` - Detailed deployment instructions
- `TECH-STACK.md` - Technical overview
- `Dockerfile` - Container configuration
- `start-servers.bat` - Local development script
- All source code and configurations