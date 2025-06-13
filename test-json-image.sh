#!/bin/bash

echo "🧪 JSON IMAGE TEST - Testing current production email API"
echo "======================================================="
echo "⏰ Test started at: $(date)"
echo ""

# Test with a small image
PROD_URL="https://www.micoadmin.com"
API_ENDPOINT="$PROD_URL/api/send-email"

echo "🎯 Testing endpoint: $API_ENDPOINT"
echo "🔧 Using JSON format with base64 image"
echo ""

# Create a small test image in base64 (1x1 pixel red PNG)
BASE64_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

# Test JSON format with image
echo "📧 TEST: JSON email with base64 image"
echo "---------------------------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "json_data": {
      "email": "andsowekilledit@gmail.com",
      "subject": "JSON Test with Image",
      "body": "This is a test email sent via JSON with base64 image attachment.",
      "attachments": [
        {
          "filename": "test-image.png",
          "content": "'$BASE64_IMAGE'",
          "type": "image/png",
          "disposition": "attachment"
        }
      ]
    }
  }' \
  -w "\nHTTP_CODE: %{http_code}\n"

echo ""
echo "🏁 Test completed at: $(date)"
