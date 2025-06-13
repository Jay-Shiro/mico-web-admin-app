"use client";

import { useState } from "react";

export default function TestSendPage() {
  const [email, setEmail] = useState("test@example.com");
  const [subject, setSubject] = useState("Test Email");
  const [body, setBody] = useState("<p>This is a test email</p>");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      console.log("🧪 Starting test email send");

      const formData = new FormData();
      formData.append("email", email);
      formData.append("subject", subject);
      formData.append("body", body);

      if (image) {
        console.log("🖼️ Adding image:", image.name, image.size);
        formData.append("image", image);
      }

      console.log("📤 Sending request to /api/send-email");

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      console.log(
        "📨 Response received:",
        response.status,
        response.statusText
      );

      const data = await response.json();
      console.log("📄 Response data:", data);

      setResult({
        status: response.status,
        success: response.ok,
        data: data,
      });
    } catch (error: any) {
      console.error("❌ Test email error:", error);
      setResult({
        status: "error",
        success: false,
        data: { error: error.message },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Email Send</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-2 border rounded-lg h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
            />
            {image && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {image.name} ({(image.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className={`w-full py-3 px-4 rounded-lg font-semibold ${
              sending
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {sending ? "Sending..." : "Send Test Email"}
          </button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <h3 className="font-semibold mb-2">
                {result.success ? "✅ Success!" : "❌ Error!"}
              </h3>
              <p className="text-sm mb-2">Status: {result.status}</p>
              <pre className="text-xs bg-white/50 p-2 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
