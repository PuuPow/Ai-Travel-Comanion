# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for Prisma
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create database directory and initialize database
RUN mkdir -p /app/data && touch /app/data/prod.db

# Set proper permissions
RUN chmod 755 /app/data

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV DATABASE_URL=file:./data/prod.db

# Start the application
CMD ["node", "src/server.js"]
