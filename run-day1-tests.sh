#!/bin/bash
# Day 1 Complete Test Execution Script
# Run this script to execute all Epic 1 tests

set -e  # Exit on error

echo "🚀 Day 1 Epic 1 Test Execution"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Database Setup
echo -e "${YELLOW}Step 1: Database Setup${NC}"
echo "Creating database..."
createdb aicv_db 2>/dev/null || echo "Database already exists (OK)"

# Step 2: Navigate to project
cd /Users/verakironaki/Documents/GitHub/SG-Gruppe-12

# Step 3: Apply Prisma migrations
echo ""
echo -e "${YELLOW}Step 2: Applying Prisma Migrations${NC}"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aicv_db" \
  npx prisma migrate deploy --schema=./prisma/schema.prisma

# Step 4: Generate Prisma client
echo ""
echo -e "${YELLOW}Step 3: Generating Prisma Client${NC}"
npx prisma generate --schema=./prisma/schema.prisma

# Step 5: Install test dependencies
echo ""
echo -e "${YELLOW}Step 4: Installing Test Dependencies${NC}"
cd src
npm install --save-dev supertest@6.3.3 @types/supertest 2>/dev/null || echo "Dependencies already installed (OK)"

# Step 6: Check if server is running
echo ""
echo -e "${YELLOW}Step 5: Checking Server Status${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ Server already running on port 3000${NC}"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}⚠ Server not running. Starting server...${NC}"
    echo "Please start server in another terminal:"
    echo "  cd /Users/verakironaki/Documents/GitHub/SG-Gruppe-12/src"
    echo "  npm run dev"
    echo ""
    read -p "Press Enter when server is running..."
    SERVER_RUNNING=true
fi

# Step 7: Run manual tests
echo ""
echo -e "${YELLOW}Step 6: Running Manual Tests${NC}"
cd /Users/verakironaki/Documents/GitHub/SG-Gruppe-12
./EPIC1-MANUAL-TEST-SCRIPT.sh

MANUAL_EXIT_CODE=$?

# Step 8: Run automated tests
echo ""
echo -e "${YELLOW}Step 7: Running Automated Tests with Coverage${NC}"
cd src
npm test -- --coverage

AUTO_EXIT_CODE=$?

# Summary
echo ""
echo "=============================="
echo "📊 Test Execution Summary"
echo "=============================="

if [ $MANUAL_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Manual Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Manual Tests: FAILED (exit code: $MANUAL_EXIT_CODE)${NC}"
fi

if [ $AUTO_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Automated Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Automated Tests: FAILED (exit code: $AUTO_EXIT_CODE)${NC}"
fi

echo ""

if [ $MANUAL_EXIT_CODE -eq 0 ] && [ $AUTO_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Epic 1 is ready to be marked as DONE.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review output above for details.${NC}"
    exit 1
fi
