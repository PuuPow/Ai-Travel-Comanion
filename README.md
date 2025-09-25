# Travel Planner 🛫

An AI-powered travel planning application that helps you create detailed itineraries, manage reservations, and generate smart packing lists for your trips.

## Features

- **🗺️ Smart Itineraries**: AI-generated day-by-day travel plans tailored to your preferences
- **📅 Reservation Management**: Keep track of flights, hotels, restaurants, and activities
- **🎒 Smart Packing Lists**: Get destination-specific packing suggestions
- **🤖 AI Integration**: Powered by OpenAI for intelligent travel recommendations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with SQLite database
- **OpenAI API** for AI-powered suggestions
- **CORS** enabled for frontend communication

### Frontend
- **Next.js 14** with React 18
- **Tailwind CSS** for styling
- **React Icons** for UI icons
- **Date-fns** for date manipulation
- **Axios** for API calls

### DevOps
- **Docker & Docker Compose** for containerization
- **ESLint** for code linting

## Project Structure

```
travel-planner/
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.js           # Express entry point
│   │   ├── routes/
│   │   │   ├── itineraries.js
│   │   │   ├── packing.js
│   │   │   └── reservations.js
│   │   ├── services/
│   │   │   └── llmService.js   # OpenAI integration
│   │   └── prismaClient.js
│   └── .env
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── pages/
│   │   ├── index.js
│   │   └── itineraries/
│   │       ├── index.js
│   │       └── [id].js
│   ├── components/
│   │   ├── ItineraryCard.jsx
│   │   ├── DayPlanEditor.jsx
│   │   └── PackingList.jsx
│   └── styles/
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- OpenAI API key (optional, for AI features)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-planner
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   
   # Initialize database
   npx prisma generate
   npx prisma db push
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Using Docker

1. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   echo "JWT_SECRET=your_jwt_secret_here" >> .env
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432

## API Endpoints

### Itineraries
- `GET /api/itineraries` - Get all itineraries for a user
- `GET /api/itineraries/:id` - Get specific itinerary
- `POST /api/itineraries` - Create new itinerary
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary
- `POST /api/itineraries/:id/generate-suggestions` - Generate AI suggestions

### Reservations
- `GET /api/reservations/user/:userId` - Get user's reservations
- `GET /api/reservations/:id` - Get specific reservation
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Packing Lists
- `GET /api/packing/itinerary/:itineraryId` - Get packing list for itinerary
- `POST /api/packing/itinerary/:itineraryId` - Create/update packing list
- `POST /api/packing/generate-suggestions/:itineraryId` - Generate AI packing suggestions

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: User accounts and authentication
- **Itinerary**: Trip plans with destinations and dates
- **Day**: Daily plans within itineraries
- **Reservation**: Bookings for flights, hotels, etc.
- **PackingList**: Travel packing lists with items

## AI Features

The application integrates with OpenAI's GPT-4 to provide:

1. **Itinerary Suggestions**: Generate detailed day-by-day plans based on destination, duration, and preferences
2. **Packing List Recommendations**: Create comprehensive, destination-specific packing lists
3. **Destination Information**: Provide travel tips, local customs, and recommendations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Production Deployment

1. **Build the application**
   ```bash
   cd frontend && npm run build
   cd ../backend && npm install --production
   ```

2. **Set up production database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Configure environment variables for production**
   - Set `NODE_ENV=production`
   - Use a production database URL
   - Set secure JWT secret
   - Configure CORS for your domain

### Docker Production

```bash
# Build and run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check if the database file exists
   - Run `npx prisma generate` and `npx prisma db push`

2. **OpenAI API Issues**
   - Verify your API key is correctly set
   - Check your OpenAI account has sufficient credits

3. **CORS Issues**
   - Ensure frontend and backend URLs match your configuration
   - Check CORS settings in the backend

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript/ESLint errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-repo/travel-planner/issues) on GitHub.

---

Happy travels! ✈️ 🌍