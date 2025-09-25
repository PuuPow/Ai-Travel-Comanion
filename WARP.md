# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture Overview

This is a full-stack travel planning application with separate frontend and backend services:

### Backend Architecture
- **Express.js API** with modular route structure (`/api/itineraries`, `/api/packing`, `/api/reservations`)
- **Prisma ORM** with SQLite for development (configurable for PostgreSQL in production)
- **OpenAI GPT-4 integration** for AI-powered itinerary and packing list generation
- **Service layer pattern** with dedicated LLM service for AI interactions

### Frontend Architecture
- **Next.js 14** with React 18 and page-based routing
- **Tailwind CSS** for utility-first styling
- **Component-based architecture** with reusable UI components
- **Axios** for API communication with the Express backend

### Database Schema
The application uses 5 main models with clear relationships:
- `User` → has many `Itinerary`, `Reservation`, `PackingList`
- `Itinerary` → has many `Day`, optional `PackingList`, many `Reservation`
- `Day` → stores activities as JSON, belongs to `Itinerary`
- `Reservation` → can optionally belong to `Itinerary`
- `PackingList` → one-to-one with `Itinerary`

### Key AI Integration Points
The `llmService.js` provides three main AI functions:
- `generateItinerarySuggestions()` - Creates day-by-day travel plans
- `generatePackingListSuggestions()` - Generates destination-specific packing lists  
- `generateDestinationInfo()` - Provides travel tips and destination information

## Development Commands

### Backend Development
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run db:push      # Push Prisma schema changes to database
npm run db:generate  # Generate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio for database GUI
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production build
npm run lint         # Run ESLint
```

### Full Application Setup
```bash
# Backend setup
cd backend && npm install
npx prisma generate && npx prisma db push
npm run dev

# Frontend setup (in new terminal)
cd frontend && npm install
npm run dev
```

### Docker Development
```bash
# Set environment variables first
echo "OPENAI_API_KEY=your_key_here" > .env
echo "JWT_SECRET=your_secret_here" >> .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Environment Configuration

### Required Environment Variables
**Backend (.env):**
- `OPENAI_API_KEY` - Required for AI features
- `JWT_SECRET` - For authentication 
- `DATABASE_URL` - SQLite for dev, PostgreSQL for production
- `PORT` - API server port (default: 3001)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

### Development vs Production Database
- **Development**: Uses SQLite with `DATABASE_URL="file:./dev.db"`
- **Production**: Configure PostgreSQL connection string
- **Docker**: Includes PostgreSQL and Redis services

## Testing and Development Workflow

### Running Single Components
- **Backend only**: `cd backend && npm run dev`
- **Frontend only**: `cd frontend && npm run dev` (requires backend running)
- **Database management**: Use `npm run db:studio` for visual database editing

### API Testing
The backend provides a health check endpoint (`/health`) and root endpoint (`/`) that lists all available API routes.

### Common Development Tasks
- **Add new API endpoint**: Create route in `backend/src/routes/`, register in `index.js`
- **Database schema changes**: Edit `prisma/schema.prisma`, run `npm run db:push` and `npm run db:generate`
- **Add new page**: Create in `frontend/pages/`, Next.js handles routing automatically
- **Modify AI prompts**: Edit functions in `backend/src/services/llmService.js`

## Project-Specific Notes

### AI Service Integration
- All AI calls go through the centralized `llmService.js`
- Responses are parsed as JSON with error handling for malformed responses
- GPT-4 model is used with system prompts for consistent formatting
- AI features gracefully degrade if OpenAI API key is missing

### Database Patterns
- Uses `cuid()` for primary keys instead of auto-incrementing integers
- JSON fields store complex data (activities, packing items)
- Cascade deletes ensure data consistency
- Prisma client is initialized in separate module for reuse

### Frontend State Management
- Uses React hooks for local state (no global state management currently)
- API calls centralized through axios
- Component-based architecture with clear separation of concerns

### Docker Architecture
- Multi-service setup with backend, frontend, database, and Redis
- Development volumes for hot reloading
- Production-ready with separate compose files
- Network isolation with custom bridge network

## Development Server URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database (Docker)**: localhost:5432
- **Redis (Docker)**: localhost:6379