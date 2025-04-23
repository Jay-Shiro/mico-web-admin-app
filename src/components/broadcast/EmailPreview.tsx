"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EmailPreviewProps = {
  emailContent: {
    subject: string;
    body: string;
    template: string;
  };
  selectedRecipients: any[];
  onBack: () => void;
  onContinue: () => void;
};

export default function EmailPreview({
  emailContent,
  selectedRecipients,
  onBack,
  onContinue,
}: EmailPreviewProps) {
  const [previewRecipient, setPreviewRecipient] = useState(
    selectedRecipients[0]
  );
  const [previewType, setPreviewType] = useState<"desktop" | "mobile">(
    "desktop"
  );

  // Function to replace parameters with actual values
  const replaceParameters = (content: string, recipient: any) => {
    if (!recipient) return content;

    let result = content;
    // Replace all occurrences of {parameter} with actual value
    Object.keys(recipient).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      result = result.replace(regex, recipient[key] || `{${key}}`);
    });

    return result;
  };

  const subjectWithParams = replaceParameters(
    emailContent.subject,
    previewRecipient
  );
  const bodyWithParams = replaceParameters(emailContent.body, previewRecipient);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-color1 text-white">
        <h2 className="text-xl font-bold mb-2">Preview Email</h2>
        <p className="text-sm text-color1lite">
          Preview how your email will look to recipients
        </p>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Preview recipient:</span>
            <select
              value={previewRecipient?.id || ""}
              onChange={(e) => {
                const selected = selectedRecipients.find(
                  (r) => r.id === e.target.value
                );
                if (selected) setPreviewRecipient(selected);
              }}
              className="text-sm border rounded-md px-2 py-1"
            >
              {selectedRecipients.slice(0, 10).map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
              {selectedRecipients.length > 10 && (
                <option disabled>
                  ...and {selectedRecipients.length - 10} more
                </option>
              )}
            </select>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                previewType === "desktop"
                  ? "bg-white shadow-sm text-color1"
                  : "text-gray-500"
              }`}
              onClick={() => setPreviewType("desktop")}
            >
              Desktop
            </button>
            <button
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                previewType === "mobile"
                  ? "bg-white shadow-sm text-color1"
                  : "text-gray-500"
              }`}
              onClick={() => setPreviewType("mobile")}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* Email Preview */}
        <div className="flex justify-center">
          <motion.div
            className={`border rounded-lg overflow-hidden shadow-md ${
              previewType === "mobile" ? "max-w-[375px]" : "w-full max-w-2xl"
            }`}
            initial={false}
            animate={{
              width: previewType === "mobile" ? 375 : "100%",
              transition: { duration: 0.3 },
            }}
          >
            {/* Email Header */}
            <div className="bg-gray-100 p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-color2 rounded-full flex items-center justify-center text-white font-bold">
                    {previewRecipient?.name.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="ml-2 text-sm font-medium">
                    {previewRecipient?.name || "Recipient"}
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <span>Today</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-base font-medium text-color1">
                {subjectWithParams}
              </div>
              <div className="text-xs text-gray-500">
                to: {previewRecipient?.email}
              </div>
            </div>

            {/* Email Body */}
            <div className="p-4 bg-white min-h-[300px]">
              <div
                dangerouslySetInnerHTML={{ __html: bodyWithParams }}
                className="prose max-w-none"
              />
            </div>
          </motion.div>
        </div>

        {/* Email Summary */}
        <div className="mt-6 bg-color3lite/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Email Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Recipients</div>
              <div className="font-medium">
                {selectedRecipients.length}{" "}
                {selectedRecipients[0]?.type === "rider"
                  ? "rider(s)"
                  : "customer(s)"}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Subject</div>
              <div className="font-medium truncate">{emailContent.subject}</div>
            </div>
            <div>
              <div className="text-gray-500">Template</div>
              <div className="font-medium capitalize">
                {emailContent.template || "Custom Email"}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Content Length</div>
              <div className="font-medium">
                {emailContent.body.replace(/<[^>]*>/g, "").length} characters
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <motion.button
            className="px-5 py-2 bg-color1lite text-color1 rounded-lg"
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(180, 217, 255, 0.8)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
          >
            Back to Editor
          </motion.button>

          <motion.button
            className="px-5 py-2 bg-color2 text-white rounded-lg shadow-sm"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 10px rgba(126, 168, 82, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
          >
            Proceed to Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}
