# Technical Stack Overview

## Frontend Dependencies (Next.js)
```json
{
  "dependencies": {
    "next": "14.0.3",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^4.12.0",
    "@stripe/stripe-js": "^2.4.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## Backend Dependencies (Node.js)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@prisma/client": "^5.7.1",
    "prisma": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "stripe": "^14.12.0",
    "dotenv": "^16.3.1"
  }
}
```

## Database Schema (Prisma)
```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
  name     String?
  itineraries Itinerary[]
}

model Itinerary {
  id          Int      @id @default(autoincrement())
  title       String
  destination String
  startDate   DateTime
  endDate     DateTime
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  activities  Activity[]
}

model Activity {
  id           Int       @id @default(autoincrement())
  title        String
  description  String?
  location     String?
  date         DateTime
  time         String?
  itineraryId  Int
  itinerary    Itinerary @relation(fields: [itineraryId], references: [id])
}
```

## API Routes
- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/itineraries` - Get user itineraries
- `POST /api/itineraries` - Create itinerary
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary
- `POST /api/payments/create-checkout-session` - Stripe checkout
- `GET /api/meals/:location` - Google Places restaurant search

## Environment Configuration
- Development: SQLite database file
- Production: PostgreSQL recommended
- Stripe: Test mode keys included
- Google Places API: Key configured