#!/bin/bash

echo "🧪 VERIFICATION TEST: Working FastAPI Backend"
echo "=============================================="
echo "⏰ Test started at: $(date)"
echo ""

# Test the working FastAPI backend directly
FASTAPI_URL="https://deliveryapi-ten.vercel.app"
FASTAPI_ENDPOINT="$FASTAPI_URL/send-email"

echo "🎯 Testing WORKING FastAPI endpoint: $FASTAPI_ENDPOINT"
echo "📧 This should return 200 OK to confirm our format is correct"
echo ""

echo "📡 Making request to working FastAPI backend..."
RESPONSE=$(curl -s -w "\n%{http_code}\n" -X POST "$FASTAPI_ENDPOINT" \
  -H "accept: application/json" \
  -F "email=andsowekilledit@gmail.com" \
  -F "subject=Format Verification Test" \
  -F "body=Testing our request format against the known-working FastAPI backend")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "FastAPI Backend Response:"
echo "HTTP Status: $HTTP_CODE"
echo "Response Body: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ SUCCESS: Our request format is CORRECT!"
  echo "🔍 The issue is with our Next.js API, not the request format"
  echo ""
  echo "📋 CONFIRMED ISSUES:"
  echo "1. ✅ Request format is valid (works with FastAPI backend)"
  echo "2. ❌ Our Next.js API is not handling the request properly"
  echo ""
  echo "🔧 NEXT STEPS:"
  echo "1. Ensure latest code is deployed to production"
  echo "2. Check Vercel function logs for specific errors"
  echo "3. Verify the API route exists and is accessible"
else
  echo ""
  echo "❌ Unexpected: Even the working FastAPI backend failed"
  echo "🔍 This suggests a network or request format issue"
  echo "HTTP Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "⏰ Test completed at: $(date)"
