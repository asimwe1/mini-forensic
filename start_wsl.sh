#!/bin/bash

echo "Starting Mini Forensic Development Environment in WSL..."

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

# Start backend server in the background
echo "Starting backend server in the background..."
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend_logs.txt 2>&1 &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID (logs in backend_logs.txt)"
cd ..

# Start frontend server in the background
echo "Starting frontend server in the background..."
cd frontend
npm run dev > frontend_logs.txt 2>&1 &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID (logs in frontend_logs.txt)"
cd ..

echo "Development servers are running!"
echo "Frontend is available at http://localhost:3000"
echo "Backend is available at http://localhost:8000"
echo "API documentation is available at http://localhost:8000/api/docs"
echo "Redis is running on localhost:6379"

echo "To view backend logs: tail -f backend/backend_logs.txt"
echo "To view frontend logs: tail -f frontend/frontend_logs.txt"
echo "To stop the servers: kill $BACKEND_PID $FRONTEND_PID"

# Save PIDs to a file for easy cleanup
echo "$BACKEND_PID $FRONTEND_PID" > .server_pids

echo "Press Ctrl+C to stop this script (servers will continue running)"
echo "To stop all servers later, run: ./stop_servers.sh" 