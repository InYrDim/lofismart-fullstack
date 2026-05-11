#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}    ♻️  LofiSmart Full Reset & Dev Starter          ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Pastikan Docker dan MySQL berjalan dulu (karena reset-db butuh MySQL)
echo -e "${YELLOW}🐳 Memastikan Docker & MySQL siap...${NC}"
docker compose up -d

# Tunggu MySQL sebentar (sama seperti logic di start-dev.sh)
echo -e "${YELLOW}⏳ Menunggu MySQL...${NC}"
MAX_RETRIES=30
COUNT=0
until docker exec lofishmart_mysql mysqladmin ping -h localhost --silent 2>/dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
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
echo -e "\n${CYAN}🚀 Memulai Server Development...${NC}"
bash start-dev.sh
