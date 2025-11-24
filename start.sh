#!/bin/bash
echo "Starting Spaceship Racer..."

if command -v npm &> /dev/null; then
    echo "Node.js detected. Installing dependencies..."
    npm install
    echo "Starting Vite server..."
    npm run dev
elif command -v python3 &> /dev/null; then
    echo "Node.js not found. Trying Python 3..."
    python3 -m http.server 5173
else
    echo "Error: Neither Node.js nor Python 3 found. Please install Node.js."
    exit 1
fi
