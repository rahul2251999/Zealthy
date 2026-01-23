#!/bin/bash

# Local Testing Script
echo "🧪 Testing Application Locally"
echo ""

echo "1. Starting Backend Test..."
cd server
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "Starting backend server on port 8000..."
echo "Backend will be available at: http://127.0.0.1:8000"
echo "API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn main:app --host 127.0.0.1 --port 8000
