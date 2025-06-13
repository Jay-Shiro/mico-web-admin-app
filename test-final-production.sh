#!/bin/bash

echo "🧪 FINAL PRODUCTION EMAIL API TEST"
echo "=================================="
echo "⏰ Test started at: $(date)"
echo ""

# Test the fixed API endpoint
PROD_URL="https://www.micoadmin.com"
API_ENDPOINT="$PROD_URL/api/send-email"

echo "🎯 Testing endpoint: $API_ENDPOINT"
echo "🔧 Method: URL-encoded form data (production-safe)"
echo ""

# Test with verbose output
echo "📧 Sending test email..."
RESPONSE=$(curl -v -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -d "email=test@example.com&subject=Fixed Production API Test&body=This email tests the fixed production API that uses URL-encoded data instead of multipart FormData." \
  2>&1)

echo "📡 Full Response:"
echo "$RESPONSE"

echo ""
echo "🔍 Analysis:"
if echo "$RESPONSE" | grep -q "200 OK"; then
  echo "✅ SUCCESS: Got 200 OK response!"
elif echo "$RESPONSE" | grep -q "400 Bad Request"; then
  echo "❌ STILL FAILING: 400 Bad Request error persists"
  echo "🔧 This suggests the FastAPI backend may not accept URL-encoded data"
elif echo "$RESPONSE" | grep -q "404"; then
  echo "⚠️ 404 Error: Endpoint not found or not deployed yet"
else
  echo "🔍 Unexpected response - check the details above"
fi

echo ""
echo "📝 Next Steps:"
echo "1. If you see 200 OK: ✅ The fix is working!"
echo "2. If you see 400 Bad Request: 🔧 The FastAPI backend needs to accept URL-encoded data"
echo "3. If you see 404: 🚀 Deploy the latest version first"
echo ""
echo "⏰ Test completed at: $(date)"
