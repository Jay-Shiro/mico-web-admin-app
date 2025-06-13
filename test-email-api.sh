#!/bin/bash

# Test script to verify the email sending API improvements with formdata-node
# This can be run to test the production deployment

echo "🧪 Testing email sending API with formdata-node improvements..."

# Test 1: Send email without image
echo "📧 Test 1: Sending email without image..."
curl -X POST "${VERCEL_URL:-http://localhost:3000}/api/send-email" \
  -F "email=test@example.com" \
  -F "subject=Test Email - No Image (formdata-node)" \
  -F "body=<p>This is a test email without any images using formdata-node.</p>"

echo -e "\n\n"

# Test 2: Send email with image (using a small test image)
echo "📧 Test 2: Sending email with image..."
# Create a small test image if it doesn't exist
if [ ! -f "test-image.png" ]; then
  echo "Creating test image..."
  # Create a 1x1 pixel PNG (base64 encoded)
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > test-image.png
fi

curl -X POST "${VERCEL_URL:-http://localhost:3000}/api/send-email" \
  -F "email=test@example.com" \
  -F "subject=Test Email - With Image (formdata-node)" \
  -F "body=<p>This is a test email with an image using formdata-node for better Vercel compatibility.</p>" \
  -F "image=@test-image.png"

echo -e "\n\n"
echo "✅ Test completed. The formdata-node implementation should resolve the 'parsing the body' error on Vercel."
echo "🔍 Check the console logs for 'Using formdata-node for better multipart compatibility' message."
