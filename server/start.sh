#!/bin/sh
# Startup script for Railway deployment
# Handles PORT environment variable properly

PORT=${PORT:-8000}
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
