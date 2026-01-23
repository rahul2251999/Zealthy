# Backend-only container for FastAPI
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
# DB_PATH defaults to /app/db.sqlite3 (in app directory, which is writable)
# Can be overridden with Railway environment variable if needed

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps from server directory
COPY server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code from server directory
COPY server/ /app/

# Copy and make startup script executable
COPY server/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# App directory is already writable, database will be created there by default
# If you need persistent storage, mount a volume and set DB_PATH env var

EXPOSE 8000

# Use startup script to properly handle PORT variable
CMD ["/app/start.sh"]
