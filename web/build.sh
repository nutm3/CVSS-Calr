#!/bin/bash

DEFAULT_PORT=9112
APP_NAME="CVSSCalr v1.0"
DIST_DIR="./dist"
COMPOSE_FILE="$DIST_DIR/docker-compose.yml"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

get_current_port() {
    if [ -f "$COMPOSE_FILE" ]; then
        grep -oP 'PORT=\K\d+' "$COMPOSE_FILE" | head -1 || echo $DEFAULT_PORT
    else
        echo $DEFAULT_PORT
    fi
}

update_port_config() {
    local new_port=$1
    echo -e "${YELLOW}[*] Updating configuration files to port $new_port...${NC}" >&2
    
    if [ -f "$COMPOSE_FILE" ]; then
        sed -i "s/PORT=[0-9]*/PORT=$new_port/g" "$COMPOSE_FILE"
        sed -i "s/- \"\${APP_PORT:-[0-9]*}:/- \"\${APP_PORT:-$new_port}:/g" "$COMPOSE_FILE"
        sed -i "s/:[0-9]*\"/:$new_port\"/g" "$COMPOSE_FILE" 
    fi
    echo -e "${GREEN}[+] Config updated to Port $new_port.${NC}" >&2
}

resolve_port_conflict() {
    local target_port=$1
    local PID=""
    
    if command -v lsof &> /dev/null; then
        PID=$(lsof -ti :$target_port 2>/dev/null | head -n 1)
    elif command -v ss &> /dev/null; then
        PID=$(ss -lptn 'sport = :'$target_port | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -n 1)
    elif command -v netstat &> /dev/null; then
        # Handle Linux netstat output format which is typically "PID/Program name"
        PID=$(netstat -nlp 2>/dev/null | grep ":$target_port " | awk '{print $NF}' | cut -d/ -f1 | head -n 1)
    fi
    
    if [ ! -z "$PID" ]; then
        echo -e "${RED}[!] Port $target_port is currently BUSY (PID: $PID).${NC}" >&2
        echo -e "${YELLOW}Conflict Resolution Options:${NC}" >&2
        echo -e "   [1] Reset Port (Kill Process) & Use Port $target_port" >&2
        echo -e "   [2] Change to a New Port" >&2
        echo -e "   [3] Cancel" >&2
        
        read -p "Select option [1-3]: " choice >&2
        
        case $choice in
            1)
                echo -e "${YELLOW}[*] Killing PID $PID...${NC}" >&2
                sudo kill -9 $PID 2>/dev/null || taskkill //PID $PID //F 2>/dev/null
                sleep 1
                echo -e "${GREEN}[+] Process killed. Port $target_port is free.${NC}" >&2
                echo "$target_port"
                ;;
            2)
                read -p "Enter new port number: " new_port >&2
                if [[ "$new_port" =~ ^[0-9]+$ ]]; then
                    update_port_config $new_port
                    echo "$new_port"
                else
                    echo -e "${RED}[!] Invalid port.${NC}" >&2
                    exit 1
                fi
                ;;
            *)
                echo -e "${RED}[!] Operation cancelled.${NC}" >&2
                exit 0
                ;;
        esac
    else
        echo -e "${GREEN}[+] Port $target_port is free.${NC}" >&2
        echo "$target_port"
    fi
}

clear
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}    ${APP_NAME} SMART LAUNCHER       ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "1. Check Installed Dependencies"
echo -e "2. Install Dependencies (npm install)"
echo -e "3. Start Application (Production)"
echo -e "4. Start Developer Mode (Nodemon)"
echo -e "5. Exit"
echo -e "========================================="
read -p "Select an option [1-5]: " option

CURRENT_PORT=$(get_current_port)

case $option in
    1)
        echo -e "\n${BLUE}[*] Checking System...${NC}"
        echo -n "Node.js: "; command -v node &> /dev/null && echo -e "${GREEN}OK ($(node -v))${NC}" || echo -e "${RED}MISSING${NC}"
        echo -n "NPM:     "; command -v npm &> /dev/null && echo -e "${GREEN}OK ($(npm -v))${NC}" || echo -e "${RED}MISSING${NC}"
        echo -n "Docker:  "; command -v docker &> /dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${RED}MISSING${NC}"
        ;;

    2)
        echo -e "\n${BLUE}[*] Installing Dependencies...${NC}"
        cd $DIST_DIR
        npm install
        echo -e "${GREEN}[+] Done.${NC}"
        ;;

    3)
        echo -e "\n${BLUE}[*] Preparing Production Launch...${NC}"
        
        echo -e "\n${YELLOW}[?] Execution Mode:${NC}"
        echo -e "   (d) Docker Container"
        echo -e "   (l) Local Node.js"
        read -p "Select [d/l] (default: l): " run_mode
        run_mode=${run_mode:-l}

        if [[ "$run_mode" == "d" ]]; then
            if [ -f "$COMPOSE_FILE" ]; then
                 echo -e "${BLUE}[*] Checking for existing containers...${NC}"
                 sudo docker compose -f "$COMPOSE_FILE" down 2>/dev/null
            fi
        fi

        FINAL_PORT=$(resolve_port_conflict $CURRENT_PORT)

        if [[ "$run_mode" == "l" ]] && [ ! -d "$DIST_DIR/node_modules" ]; then
            echo -e "${YELLOW}[*] node_modules missing. Installing dependencies...${NC}"
            cd $DIST_DIR && npm install && cd ..
        fi

        cd $DIST_DIR
        if [[ "$run_mode" == "d" ]]; then
             echo -e "${BLUE}[*] Starting Docker on Port $FINAL_PORT...${NC}"
             export APP_PORT=$FINAL_PORT
             export PORT=$FINAL_PORT
             sudo docker compose up --build -d
             [ $? -eq 0 ] && echo -e "${GREEN}[+] App running: http://localhost:$FINAL_PORT${NC}" || echo -e "${RED}[!] Docker failed to start.${NC}"
        else
             echo -e "${BLUE}[*] Starting Local Server on Port $FINAL_PORT...${NC}"
             export PORT=$FINAL_PORT
             npm start
        fi
        ;;

    4)
        echo -e "\n${BLUE}[*] Preparing Dev Mode...${NC}"
        FINAL_PORT=$(resolve_port_conflict $CURRENT_PORT)
        cd $DIST_DIR
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}[*] node_modules missing. Installing...${NC}"
            npm install
        fi
        echo -e "${BLUE}[*] Starting Nodemon on $FINAL_PORT...${NC}"
        export PORT=$FINAL_PORT
        command -v nodemon &> /dev/null && nodemon src/server.js || npx nodemon src/server.js
        ;;

    5)
        echo "Bye!"
        exit 0
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac
