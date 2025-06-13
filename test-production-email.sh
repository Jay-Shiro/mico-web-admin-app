#!/bin/bash

# Production Email API Test Script
# Tests the fixed email API in production mode

echo "🧪 PRODUCTION EMAIL API TEST"
echo "============================="
echo "⏰ Test started at: $(date)"
echo ""

# Set production URL
PROD_URL="https://www.micoadmin.com"
API_ENDPOINT="$PROD_URL/api/send-email"

echo "🎯 Testing endpoint: $API_ENDPOINT"
echo ""

# Test 1: Simple email without images (should work now)
echo "📧 TEST 1: Simple email without images"
echo "--------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}\n" -X POST "$API_ENDPOINT" \
  -F "email=test@example.com" \
  -F "subject=Production Test Email - $(date +%H:%M)" \
  -F "body=This is a test email from the fixed production API. Testing URL-encoded approach for reliability.")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ TEST 1 PASSED: Email API working in production!"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "❌ TEST 1 FAILED: Still getting 400 Bad Request"
  echo "🔍 Response details:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
else
  echo "⚠️ TEST 1 UNEXPECTED: HTTP $HTTP_CODE"
  echo "🔍 Response details:"
  echo "$RESPONSE_BODY"
fi

echo ""
echo "🔍 DEBUGGING INFO:"
echo "- This test uses the new production-safe approach"
echo "- Images are temporarily disabled in production"
echo "- Using URL-encoded form data instead of multipart"
echo "- Enhanced logging for troubleshooting"

echo ""
echo "📊 NEXT STEPS:"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Production email API is now working!"
  echo "🎉 You can deploy this version to production"
  echo "📝 Images are temporarily disabled but can be re-enabled after testing"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "🔧 Still getting 400 errors. Check the FastAPI backend:"
  echo "   - Ensure it accepts application/x-www-form-urlencoded"
  echo "   - Check if the endpoint expects different field names"
  echo "   - Review server logs for detailed error messages"
else
  echo "🔍 Unexpected response. Check network connectivity and server status"
fi

echo ""
echo "⏰ Test completed at: $(date)"
