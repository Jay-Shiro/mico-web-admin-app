#!/bin/bash

# Simple test script for the email API
# Usage: ./test-email-api-simple.sh

# Check if we're in development or production mode
if [ -f ".env.local" ]; then
    API_URL="http://localhost:3000"
    echo "🧪 Testing in DEVELOPMENT mode"
else
    API_URL="https://deliveryapi-ten.vercel.app"
    echo "🚀 Testing in PRODUCTION mode"
fi

echo "📧 Testing send-email API at: $API_URL/api/send-email"
echo "⏰ Starting test at: $(date)"

# Test 1: Simple email without images
echo ""
echo "🧪 TEST 1: Simple email without images"
curl -X POST "$API_URL/api/send-email" \
  -F "email=test@example.com" \
  -F "subject=Test Email from API" \
  -F "body=This is a test email sent from the fixed API endpoint. No images attached." \
  -w "\n📊 HTTP Status: %{http_code}\n⏱️  Total Time: %{time_total}s\n📏 Response Size: %{size_download} bytes\n" \
  -s

echo ""
echo "✅ Test completed at: $(date)"
echo ""
echo "💡 If you see 'success: true' in the response, the API is working!"
echo "💡 If you see 400 or 500 errors, check the server logs for details."
