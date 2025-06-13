#!/bin/bash

echo "🔍 DETAILED EMAIL API DEBUG TEST"
echo "================================="
echo "⏰ Test started at: $(date)"
echo ""

# Test the exact format from FastAPI docs
PROD_URL="https://www.micoadmin.com"
API_ENDPOINT="$PROD_URL/api/send-email"

echo "🎯 Testing endpoint: $API_ENDPOINT"
echo ""

# Test 1: Get detailed curl output
echo "📧 TEST 1: Detailed curl with verbose output"
echo "--------------------------------------------"

echo "📡 Making request with full verbose output..."
curl -v -X POST "$API_ENDPOINT" \
  -H "accept: application/json" \
  -F "email=andsowekilledit@gmail.com" \
  -F "subject=Debug Test" \
  -F "body=This is a debug test to get detailed error information" \
  2>&1 | tee curl_debug.log

echo ""
echo "🔍 Analysis of response:"
if grep -q "400 Bad Request" curl_debug.log; then
  echo "❌ Confirmed: 400 Bad Request"
  echo ""
  echo "📄 Response headers:"
  grep -A 20 "< HTTP/" curl_debug.log || echo "No response headers found"
  echo ""
  echo "📄 Response body:"
  grep -A 10 "^{" curl_debug.log || echo "No JSON response body found"
elif grep -q "200 OK" curl_debug.log; then
  echo "✅ Success: 200 OK"
elif grep -q "404" curl_debug.log; then
  echo "⚠️ 404 Not Found - API endpoint may not be deployed"
elif grep -q "500" curl_debug.log; then
  echo "⚠️ 500 Internal Server Error"
else
  echo "🔍 Unexpected response - check curl_debug.log for details"
fi

echo ""
echo "🔧 DEBUGGING STEPS:"
echo "1. Check if the latest code has been deployed to production"
echo "2. Verify the API endpoint exists at: $API_ENDPOINT"
echo "3. Check Vercel function logs for detailed error messages"
echo "4. Compare our request format with the working FastAPI example"

echo ""
echo "📊 REQUEST FORMAT COMPARISON:"
echo ""
echo "Working FastAPI backend test:"
echo "curl -X 'POST' 'https://deliveryapi-ten.vercel.app/send-email' \\"
echo "  -H 'accept: application/json' \\"
echo "  -F 'email=andsowekilledit@gmail.com' \\"
echo "  -F 'subject=Testing' \\"
echo "  -F 'body=Test message'"
echo ""
echo "Our API request:"
echo "curl -X 'POST' '$API_ENDPOINT' \\"
echo "  -H 'accept: application/json' \\"
echo "  -F 'email=andsowekilledit@gmail.com' \\"
echo "  -F 'subject=Debug Test' \\"
echo "  -F 'body=This is a debug test...'"

echo ""
echo "💡 NEXT STEPS:"
echo "1. If 404: Deploy the latest code to production"
echo "2. If 400: Check Vercel function logs for specific error details"
echo "3. If 500: Check for runtime errors in the API code"

echo ""
echo "⏰ Test completed at: $(date)"

# Clean up
rm -f curl_debug.log
