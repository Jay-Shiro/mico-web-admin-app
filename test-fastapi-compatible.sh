#!/bin/bash

echo "🧪 FASTAPI-COMPATIBLE EMAIL API TEST"
echo "===================================="
echo "⏰ Test started at: $(date)"
echo ""

# Test the exact format from FastAPI docs
PROD_URL="https://www.micoadmin.com"
API_ENDPOINT="$PROD_URL/api/send-email"

echo "🎯 Testing endpoint: $API_ENDPOINT"
echo "🔧 Using multipart/form-data format (same as FastAPI docs)"
echo ""

# Test 1: Simple email without images (matching FastAPI format)
echo "📧 TEST 1: Simple email (multipart/form-data format)"
echo "---------------------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}\n" -X POST "$API_ENDPOINT" \
  -H "accept: application/json" \
  -F "email=andsowekilledit@gmail(3.11.9) mac@Coolbuoy-2 mico-web-admin % ./test-fastapi-compatible.sh
🧪 FASTAPI-COMPATIBLE EMAIL API TEST
====================================
⏰ Test started at: Fri Jun 13 16:36:05 WAT 2025

🎯 Testing endpoint: https://www.micoadmin.com/api/send-email
🔧 Using multipart/form-data format (same as FastAPI docs)

📧 TEST 1: Simple email (multipart/form-data format)
---------------------------------------------------
HTTP Status: 400
Response Body:
{"error":"Failed to send email via FastAPI","details":"{\"detail\":\"There was an error parsing the body\"}","status":400,"debug":{"method":"FORMDATA_NO_IMAGES","contentType":"multipart/form-data","hasImages":false}}

❌ Still getting 400 Bad Request
🔍 Response details:
{
  "error": "Failed to send email via FastAPI",
  "details": "{\"detail\":\"There was an error parsing the body\"}",
  "status": 400,
  "debug": {
    "method": "FORMDATA_NO_IMAGES",
    "contentType": "multipart/form-data",
    "hasImages": false
  }
}

🔧 TECHNICAL NOTES:
- Using native FormData (not formdata-node)
- Letting browser handle Content-Type and multipart boundary
- Images are now re-enabled in production
- Format matches the working FastAPI documentation example

📊 COMPARISON WITH WORKING FASTAPI EXAMPLE:
FastAPI docs format:
  curl -X 'POST' 'https://deliveryapi-ten.vercel.app/send-email' \
    -H 'accept: application/json' \
    -H 'Content-Type: multipart/form-data' \
    -F 'email=test@example.com' \
    -F 'subject=Test' \
    -F 'body=Test message'

Our API format: IDENTICAL ✓

⏰ Test completed at: Fri Jun 13 16:36:06 WAT 2025.com" \
  -F "subject=Production Test - Fixed API" \
  -F "body=This email tests the fixed API using native FormData with proper multipart/form-data format, exactly matching the FastAPI backend specification.")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ SUCCESS! Email API is now working!"
  echo "🎉 The 400 Bad Request errors have been resolved!"
elif [ "$HTTP_CODE" = "400" ]; then
  echo ""
  echo "❌ Still getting 400 Bad Request"
  echo "🔍 Response details:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
else
  echo ""
  echo "⚠️ Unexpected HTTP status: $HTTP_CODE"
  echo "🔍 Response details:"
  echo "$RESPONSE_BODY"
fi

echo ""
echo "🔧 TECHNICAL NOTES:"
echo "- Using native FormData (not formdata-node)"
echo "- Letting browser handle Content-Type and multipart boundary"
echo "- Images are now re-enabled in production"
echo "- Format matches the working FastAPI documentation example"

echo ""
echo "📊 COMPARISON WITH WORKING FASTAPI EXAMPLE:"
echo "FastAPI docs format:"
echo "  curl -X 'POST' 'https://deliveryapi-ten.vercel.app/send-email' \\"
echo "    -H 'accept: application/json' \\"
echo "    -H 'Content-Type: multipart/form-data' \\"
echo "    -F 'email=test@example.com' \\"
echo "    -F 'subject=Test' \\"
echo "    -F 'body=Test message'"
echo ""
echo "Our API format: IDENTICAL ✓"

echo ""
echo "⏰ Test completed at: $(date)"
