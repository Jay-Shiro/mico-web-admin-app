#!/bin/bash

# Test script to verify the email sending API improvements
# This can be run to test the production deployment

echo "🧪 Testing email sending API improvements..."

# Test 1: Send email without image
echo "📧 Test 1: Sending email without image..."
curl -X POST "http://localhost:3000/api/send-email" \
  -F "email=test@example.com" \
  -F "subject=Test Email - No Image" \
  -F "body=<p>This is a test email without any images.</p>"

echo -e "\n\n"

# Test 2: Send email with image (using a small test image)
echo "📧 Test 2: Sending email with image..."
# Create a small test image if it doesn't exist
if [ ! -f "test-image.png" ]; then
  echo "Creating test image..."
  # Create a 1x1 pixel PNG (base64 encoded)
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > test-image.png
fi

curl -X POST "http://localhost:3000/api/send-email" \
  -F "email=test@example.com" \
  -F "subject=Test Email - With Image" \
  -F "body=<p>This is a test email with an image.</p>" \
  -F "image=@test-image.png"

echo -e "\n\n"
echo "✅ Test completed. Check the console logs for detailed information."
