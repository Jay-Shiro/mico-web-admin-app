"use client";

import { useState } from "react";

export default function EmailTestPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testEmailSending = async (withImage: boolean = false) => {
    setLoading(true);
    setTestResult("");

    try {
      const formData = new FormData();
      formData.append("subject", "Test Email Subject");
      formData.append(
        "body",
        "<p>Hello {name},</p><p>This is a test email.</p><p>Best regards,<br>The Team</p>"
      );
      formData.append(
        "recipients",
        JSON.stringify([
          { email: "test@example.com", name: "Test User", type: "customer" },
        ])
      );

      if (withImage) {
        // Create a simple test image blob
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#7EA852";
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = "#FAE27C";
          ctx.fillRect(20, 20, 60, 60);
        }

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/png");
        });

        const testImage = new File([blob], "test-image.png", {
          type: "image/png",
        });
        formData.append("image", testImage);
      }

      // Test with our test endpoint first
      const testResponse = await fetch("/api/test-email", {
        method: "POST",
        body: formData,
      });

      const testData = await testResponse.json();
      console.log("Test endpoint response:", testData);

      if (testData.status === "success") {
        setTestResult(
          `✅ Test ${withImage ? "with image" : "without image"} passed!\n` +
            `Data structure correct: ${JSON.stringify(testData.data, null, 2)}`
        );
      } else {
        setTestResult(`❌ Test failed: ${testData.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testActualSending = async () => {
    setLoading(true);
    setTestResult("");

    try {
      const formData = new FormData();
      formData.append("subject", "Test Email from Admin Dashboard");
      formData.append(
        "body",
        "<p>Hello {name},</p><p>This is a test email from the admin dashboard.</p><p>Best regards,<br>The Mico Team</p>"
      );
      formData.append(
        "recipients",
        JSON.stringify([
          { email: "test@example.com", name: "Test User", type: "customer" },
        ])
      );

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Actual send response:", data);

      if (response.ok) {
        setTestResult(
          `✅ Email sending API works!\n` +
            `Result: ${JSON.stringify(data, null, 2)}`
        );
      } else {
        setTestResult(
          `❌ Email sending failed: ${data.message || data.detail}`
        );
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-color1 mb-8">
          Email Sending Test
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-color1 mb-4">
            Data Structure Tests
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => testEmailSending(false)}
              disabled={loading}
              className="px-6 py-3 bg-color2 text-white rounded-lg hover:bg-color2/90 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Email Data (No Image)"}
            </button>

            <button
              onClick={() => testEmailSending(true)}
              disabled={loading}
              className="px-6 py-3 bg-color4 text-color1 rounded-lg hover:bg-color4/90 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Email Data (With Image)"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-color1 mb-4">
            Actual Email Sending Test
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This will test the actual email sending API (will try to send to
            FastAPI endpoint)
          </p>
          <button
            onClick={testActualSending}
            disabled={loading}
            className="px-6 py-3 bg-color1 text-white rounded-lg hover:bg-color1/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Test Actual Email Sending"}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
