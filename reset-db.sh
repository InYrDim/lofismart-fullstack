#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}       🗑️  LofiSmart Database Reset Script         ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Load .env variables
if [ -f ".env" ]; then
    # Load variables while ignoring comments and empty lines
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ No .env file found in root.${NC}"
    exit 1
fi

# 2. Check if DB_NAME and DB_PASS are set
if [ -z "$DB_NAME" ] || [ -z "$DB_PASS" ]; then
    echo -e "${RED}❌ DB_NAME or DB_PASS not found in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}⏳ Resetting database: ${DB_NAME}...${NC}"

# 3. Execute Drop and Create via Docker
docker exec lofishmart_mysql mysql -u root -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;"

# 4. Check result
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Database '$DB_NAME' has been successfully reset!${NC}"
else
    echo -e "\n${RED}❌ Failed to reset database.${NC}"
    echo -e "${YELLOW}Make sure the Docker container 'lofishmart_mysql' is running.${NC}"
    exit 1
fi

# 5. Run Migrations and Seeders
echo -e "\n${CYAN}📦 Running migrations and seeders...${NC}"
cd lofishmart-backend

echo -e "${YELLOW}⏳ Running Migrations...${NC}"
npm run migration

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed!${NC}"
else
    echo -e "${RED}❌ Migrations failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}⏳ Running Seeders...${NC}"
npm run seeder:run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seeders completed!${NC}"
else
    echo -e "${RED}❌ Seeders failed!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ Full Database Reset & Initialization Complete! ✨${NC}"
