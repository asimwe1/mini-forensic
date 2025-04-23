#!/bin/bash

echo "Stopping Mini Forensic servers..."

if [ -f .server_pids ]; then
    PIDS=$(cat .server_pids)
    for PID in $PIDS; do
        if ps -p $PID > /dev/null; then
            echo "Stopping process with PID: $PID"
            kill $PID
        else
            echo "Process with PID $PID is not running"
        fi
    done
    rm .server_pids
    echo "Servers stopped successfully"
else
    echo "No server PIDs found. If the servers are still running, you can find and stop them manually:"
    echo "1. Run: ps aux | grep -E 'uvicorn|next'"
    echo "2. Find the PID (second column)"
    echo "3. Run: kill <PID>"
fi 