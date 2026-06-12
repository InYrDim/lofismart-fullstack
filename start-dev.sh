#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🚀 LofiSmart Development Environment Starter    ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Ensure we are in the root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# set env to dev
cp .env.dev .env
cp lofishmart-backend/.env.dev lofishmart-backend/.env
cp lofishmart-frontend/.env.dev lofishmart-frontend/.env

# set dev compose
cp docker-compose.dev.yml docker-compose.yml

# 1. Start Docker Engine if not running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}🐳 Docker is not running. Attempting to start Docker Desktop...${NC}"
    
    # Try common Windows paths for Docker Desktop
    DOCKER_PATH="/c/Program Files/Docker/Docker/Docker Desktop.exe"
    
    if [ -f "$DOCKER_PATH" ]; then
        # Use start to run without blocking, though bash & usually works too
        # On Windows bash, this path works
        "$DOCKER_PATH" &
        echo -e "${YELLOW}⏳ Waiting for Docker daemon to become responsive...${NC}"
        # Wait up to 2 minutes
        MAX_DOCKER_WAIT=60
        DOCKER_COUNT=0
        until docker info > /dev/null 2>&1 || [ $DOCKER_COUNT -eq $MAX_DOCKER_WAIT ]; do
            echo -ne "${YELLOW}.${NC}"
            sleep 2
            ((DOCKER_COUNT++))
        done
        
        if [ $DOCKER_COUNT -eq $MAX_DOCKER_WAIT ]; then
            echo -e "\n${RED}❌ Docker failed to start in time. Please start it manually.${NC}"
            exit 1
        fi
        echo -e "\n${GREEN}✅ Docker is ready!${NC}"
    else
        echo -e "${RED}❌ Docker Desktop not found at $DOCKER_PATH.${NC}"
        echo -e "${YELLOW}Please start Docker manually and try again.${NC}"
        exit 1
    fi
fi



# 2. Sync .env file
if [ -f "lofishmart-backend/.env" ] && [ -f ".env" ]; then
    if ! cmp -s "lofishmart-backend/.env" ".env"; then
        echo -e "${YELLOW}🔄 .env files are out of sync. Updating root .env from backend...${NC}"
        cp lofishmart-backend/.env .env
    fi
elif [ -f "lofishmart-backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found in root. Copying from backend...${NC}"
    cp lofishmart-backend/.env .env
elif [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found in backend. Copying from root...${NC}"
    cp .env lofishmart-backend/.env
else
    echo -e "${RED}❌ No .env file found in root or backend.${NC}"
    echo -e "${YELLOW}Please create a .env file based on .env.example${NC}"
    exit 1
fi

# 3. Start Docker Compose
echo -e "\n${CYAN}🐳 1. Starting Docker Compose services...${NC}"
docker compose up -d

# 4. Wait for MySQL (Port 3306)
echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
MAX_RETRIES=30
COUNT=0
until docker exec lofishmart_mysql mysqladmin ping -h localhost --silent 2>/dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    echo -ne "${YELLOW}.${NC}"
    sleep 2
    ((COUNT++))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo -e "\n${RED}❌ MySQL failed to start in time. Check docker logs.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ MySQL is up and running!${NC}"

# 5. Start Backend
echo -e "\n${CYAN}📦 2. Starting Backend (lofishmart-backend)...${NC}"
cd lofishmart-backend

# Load BACKEND_PORT from env
BACKEND_PORT=$(grep -E "^BACKEND_PORT=" .env | cut -d'=' -f2 | tr -d '\r')
BACKEND_PORT=${BACKEND_PORT}

# Run npm run start in background
npm run start &
BACKEND_PID=$!

# Wait for backend to be up
echo -e "${YELLOW}⏳ Waiting for Backend to be ready on port ${BACKEND_PORT}...${NC}"
COUNT=0
until curl -s http://localhost:${BACKEND_PORT}/api > /dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    echo -ne "${YELLOW}.${NC}"
    sleep 2
    ((COUNT++))
    # Check if process is still alive
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\n${RED}❌ Backend process died!${NC}"
        exit 1
    fi
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo -e "\n${RED}❌ Backend timed out!${NC}"
    kill $BACKEND_PID
    exit 1
fi

echo -e "\n${GREEN}✅ Backend is up and running!${NC}"

# 6. Start Frontend
# 6. Start Frontend
echo -e "\n${CYAN}🎨 3. Starting Frontend (lofishmart-frontend)...${NC}"
cd ../lofishmart-frontend

# Trap Ctrl+C to kill the backend process before exiting
trap "echo -e '\n${YELLOW}Stopping development environment...${NC}'; kill $BACKEND_PID; exit" SIGINT SIGTERM

# Open browser in incognito mode
echo -e "${YELLOW}🌐 Opening browser in incognito mode...${NC}"
# Attempt to open Chrome incognito, fallback to Edge InPrivate
(
    sleep 3
    if command -v start >/dev/null; then
        start chrome --incognito http://localhost:5173 2>/dev/null || \
        start msedge -inprivate http://localhost:5173 2>/dev/null || \
        start http://localhost:5173
    fi
) &

# Run frontend in foreground (interactive)
npm run dev
