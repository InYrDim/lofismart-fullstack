#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}    ♻️  LofiSmart Full Reset & Production Starter          ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Ensure env is set to prod
cp .env.prod .env
cp lofishmart-backend/.env.prod lofishmart-backend/.env
cp lofishmart-frontend/.env.prod lofishmart-frontend/.env

# Copy compose config
cp docker-compose.prod.yml docker-compose.yml

# 1. Pastikan Docker dan MySQL berjalan dulu (karena reset-db butuh MySQL)
echo -e "${YELLOW}🐳 Memastikan Docker & MySQL siap...${NC}"
docker compose up -d

# Load environment variables
if [ -f ".env" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        line=$(echo "$line" | tr -d '\r')
        if [[ ! "$line" =~ ^# ]] && [[ "$line" =~ = ]]; then
            export "$line"
        fi
    done < .env
fi

# Tunggu MySQL sebentar
echo -e "${YELLOW}⏳ Menunggu MySQL...${NC}"
MAX_RETRIES=30
COUNT=0
until docker exec lofishmart_mysql mysqladmin ping -h 127.0.0.1 -u root -p"${DB_PASS}" --silent 2>/dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    echo -ne "."
    sleep 2
    ((COUNT++))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo -e "\n${RED}❌ MySQL gagal siap. Cek Docker Desktop kamu.${NC}"
    exit 1
fi
echo -e "\n${GREEN}✅ MySQL siap.${NC}"

# 2. Jalankan Reset Database (Migration + Seeder)
echo -e "\n${CYAN}🗑️  Menjalankan Reset Database...${NC}"
bash reset-db.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Reset Database gagal. Membatalkan startup.${NC}"
    exit 1
fi

# 3. Jalankan Start Dev (Backend & Frontend)
echo -e "\n${CYAN}🚀 Memulai Server Production...${NC}"
bash start-prod.sh
