# Stage 1: Build the React Application
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Define build arguments for Vite
ARG VITE_API_BASE_URL
ARG VITE_WEBSOCKET_URL
ARG VITE_ENABLE_WEBSOCKET
ARG VITE_XENDIT_SECRET_KEY
ARG VITE_DEV
ARG VITE_PROD

# Set environment variables for the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_ENABLE_WEBSOCKET=$VITE_ENABLE_WEBSOCKET
ENV VITE_XENDIT_SECRET_KEY=$VITE_XENDIT_SECRET_KEY
ENV VITE_DEV=$VITE_DEV
ENV VITE_PROD=$VITE_PROD

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx vite build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
