# Simple single-stage build for Cloud Run
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy all frontend files
COPY frontend/ ./

# Install dependencies and generate Prisma client
RUN npm ci && npx prisma generate && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

EXPOSE 3000

# Use Next.js production server
CMD ["npx", "next", "start", "-p", "3000"]
