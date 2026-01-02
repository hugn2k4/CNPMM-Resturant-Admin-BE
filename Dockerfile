# Dockerfile for Admin Backend (NestJS) - DEV MODE
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start in dev mode with hot reload
CMD ["npm", "run", "start:dev"]
