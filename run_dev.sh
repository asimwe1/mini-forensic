#!/bin/bash

echo "Starting Mini Forensic Development Environment..."

# Check if Redis is installed and running
redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Redis is not running! Starting Redis..."
    # Try to start Redis
    sudo service redis-server start > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Failed to start Redis service!"
        echo "Please make sure Redis is installed and running."
        echo "You can start Redis manually using: sudo service redis-server start"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Create and activate Python virtual environment if it doesn't exist
if [ ! -d "backend/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/.venv
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
source .venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start backend server and frontend in separate terminals
echo "Starting backend and frontend servers..."

# Start backend server in new terminal window
gnome-terminal -- bash -c "cd backend && source .venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; read -p 'Press Enter to exit...'" 2>/dev/null

# If gnome-terminal isn't available, try using WSL's approach to launch Windows terminal
if [ $? -ne 0 ]; then
    echo "Starting backend server in new window..."
    cd backend
    source .venv/bin/activate
    start_command="cd $(pwd) && source .venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    powershell.exe -Command "Start-Process wt -ArgumentList 'wsl', '$start_command'" > /dev/null 2>&1
    
    # If that fails, try running in the background
    if [ $? -ne 0 ]; then
        echo "Could not open new terminal window. Starting backend in the background..."
        python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend_logs.txt 2>&1 &
        BACKEND_PID=$!
        echo "Backend running with PID: $BACKEND_PID"
    fi
    cd ..
fi

# Start frontend in new terminal window
gnome-terminal -- bash -c "cd frontend && npm run dev; read -p 'Press Enter to exit...'" 2>/dev/null

# If gnome-terminal isn't available, try using WSL's approach to launch Windows terminal
if [ $? -ne 0 ]; then
    echo "Starting frontend server in new window..."
    cd frontend
    start_command="cd $(pwd) && npm run dev"
    powershell.exe -Command "Start-Process wt -ArgumentList 'wsl', '$start_command'" > /dev/null 2>&1
    
    # If that fails, try running in the background
    if [ $? -ne 0 ]; then
        echo "Could not open new terminal window. Starting frontend in the background..."
        npm run dev > frontend_logs.txt 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend running with PID: $FRONTEND_PID"
    fi
    cd ..
fi

echo "Development servers are starting..."
echo "Frontend will be available at http://localhost:3000"
echo "Backend will be available at http://localhost:8000"
echo "API documentation will be available at http://localhost:8000/api/docs"
echo "Redis is running on localhost:6379"

echo "Press Ctrl+C to stop the servers"
# Keep the script running
while true; do
    sleep 1
done 