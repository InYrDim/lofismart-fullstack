FROM node:22-slim

WORKDIR /app

# Install build dependencies for native modules if needed (e.g. bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy application source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "./bin/www"]
