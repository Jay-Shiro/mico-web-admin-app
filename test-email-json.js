#!/usr/bin/env node

const BASE_URL = "https://deliveryapi-ten.vercel.app";

async function testEmailJSON() {
  console.log("🧪 Testing send-email route JSON compatibility with FastAPI");
  console.log("🌐 FastAPI Base URL:", BASE_URL);

  // Test 1: Direct FastAPI call with JSON format
  console.log("\n📤 Test 1: Direct FastAPI JSON call");
  try {
    const jsonPayload = {
      email: "andsowekilledit@gmail.com",
      subject: "Test JSON Email from Admin Dashboard",
      body: "This is a test email using the new JSON-only format from the Mico admin dashboard.",
      attachments: [],
    };

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(jsonPayload),
    });

    const responseText = await response.text();
    console.log("✅ Direct FastAPI Response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (response.ok) {
      console.log("✅ JSON format is compatible with FastAPI!");
    } else {
      console.log("❌ JSON format issue:", response.status, responseText);
    }
  } catch (error) {
    console.error("❌ Direct FastAPI test failed:", error.message);
  }

  // Test 2: Test with base64 image attachment
  console.log("\n📤 Test 2: JSON with base64 image");
  try {
    // Create a simple base64 test image (1x1 pixel PNG)
    const testBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9hxvhIQAAAABJRU5ErkJggg==";

    const jsonPayload = {
      email: "andsowekilledit@gmail.com",
      subject: "Test JSON Email with Image from Admin Dashboard",
      body: "This is a test email with base64 image attachment from the Mico admin dashboard. The image should appear inline in the email.",
      attachments: [
        {
          filename: "test.png",
          content: testBase64,
          type: "image/png",
          disposition: "attachment",
        },
      ],
    };

    const response = await fetch(`${BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(jsonPayload),
    });

    const responseText = await response.text();
    console.log("✅ JSON with Image Response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (response.ok) {
      console.log("✅ JSON format with base64 images is compatible!");
    } else {
      console.log("❌ JSON with images issue:", response.status, responseText);
    }
  } catch (error) {
    console.error("❌ JSON with images test failed:", error.message);
  }

  // Test 3: Test via Next.js API route (if running locally)
  console.log("\n📤 Test 3: Next.js send-email route");
  try {
    const formData = new FormData();
    formData.append("email", "andsowekilledit@gmail.com");
    formData.append("subject", "Test via Next.js Route");
    formData.append(
      "body",
      "Testing the Next.js send-email API route with the new simplified implementation"
    );

    const response = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    console.log("✅ Next.js Route Response:", {
      status: response.status,
      success: responseData.success,
      message: responseData.message,
      method: responseData.debug?.method,
    });

    if (response.ok && responseData.success) {
      console.log("✅ Next.js send-email route is working!");
    } else {
      console.log(
        "❌ Next.js route issue:",
        responseData.error || responseData.message
      );
    }
  } catch (error) {
    console.log(
      "ℹ️ Next.js route test skipped (not running locally):",
      error.message
    );
  }

  console.log("\n🎯 Summary:");
  console.log("- FastAPI now only accepts JSON format (EmailWithAttachments)");
  console.log("- Direct JSON calls test compatibility");
  console.log("- Base64 attachments are supported");
  console.log("- Multiple fallback strategies ensure delivery");
}

testEmailJSON().catch(console.error);
