# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy app source
COPY . .

# Create uploads and logs directories
RUN mkdir -p uploads logs && chown -R node:node /app

USER node

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', res => process.exit(res.statusCode !== 200 ? 1 : 0))"

CMD ["node", "server.js"]
