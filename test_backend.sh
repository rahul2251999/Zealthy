#!/bin/bash

# Backend Health Check Test Script
BACKEND_URL="https://zealthy-backend-production.up.railway.app"

echo "🔍 Testing Backend: $BACKEND_URL"
echo ""

echo "1. Health Check:"
curl -s "$BACKEND_URL/health" | jq '.' || echo "❌ Failed"
echo ""

echo "2. API Docs:"
curl -s "$BACKEND_URL/docs" | head -5 || echo "❌ Failed"
echo ""

echo "3. Catalog Endpoint:"
curl -s "$BACKEND_URL/catalog" | jq '.' | head -20 || echo "❌ Failed"
echo ""

echo "4. Patients Endpoint (should require auth):"
curl -s "$BACKEND_URL/patients" | jq '.' || echo "❌ Failed"
echo ""

echo "✅ Test complete!"
