#!/bin/bash

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================"
echo -e "    CVSSCalr v1.0 CLI EDITION      "
echo -e "========================================"
echo -e "${GREEN}Created by Falatehan Anshor${NC}\n"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[!] Node.js not found. Please install Node.js to use this tool.${NC}"
    exit 1
fi

# Navigate to the dist directory where the application code resides
# This handles the script being run from anywhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/dist"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}[!] Error: 'dist' directory not found at $APP_DIR${NC}"
    echo -e "${YELLOW}[*] Please ensure you have the correct directory structure.${NC}"
    exit 1
fi

cd "$APP_DIR" || exit 1

# Check and install dependencies within dist/
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[*] Installing dependencies in dist directory...${NC}"
    npm install --silent
fi

echo -e "${CYAN}[*] Launching CLI Application...${NC}\n"
node app.js
