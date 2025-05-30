"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type SendPanelProps = {
  emailContent: {
    subject: string;
    body: string;
    template: string;
  };
  selectedRecipients: any[];
  onBack: () => void;
};

export default function SendPanel({
  emailContent,
  selectedRecipients,
  onBack,
}: SendPanelProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    successful: string[];
    failed: { email: string; reason: string }[];
    total: number;
  } | null>(null);

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

  const handleSend = async () => {
    try {
      setError(null);
      setSending(true);

      // Start progress indicator
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Process emails for each recipient with personalized parameters
      const emailsToSend = selectedRecipients
        .map((recipient) => {
          // Replace parameters in subject and body with recipient's data
          const personalizedSubject = replaceParameters(
            emailContent.subject,
            recipient
          );
          const personalizedBody = replaceParameters(
            emailContent.body,
            recipient
          );

          return {
            email: recipient.email,
            subject: personalizedSubject,
            body: personalizedBody,
          };
        })
        .filter((item) => item.email); // Filter out any without email

      if (emailsToSend.length === 0) {
        clearInterval(progressInterval);
        setError("No valid email addresses found in the selected recipients.");
        setSending(false);
        return;
      }

      // Send to our API endpoint
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: emailsToSend,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send emails");
      }

      const data = await response.json();
      setResults(data.results);
      setProgress(100);
      setSent(true);
    } catch (err: any) {
      setError(`There was an error sending the emails: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // Add a function to retry sending failed emails
  const handleRetry = async () => {
    if (!results?.failed || results.failed.length === 0) return;

    try {
      setError(null);
      setSending(true);
      setProgress(0);

      // Start progress indicator again
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Get just the failed emails to retry
      const failedEmails = results.failed
        .map((item) => {
          const recipient = selectedRecipients.find(
            (r) => r.email === item.email
          );
          if (!recipient) return null;

          // Replace parameters in subject and body with recipient's data
          const personalizedSubject = replaceParameters(
            emailContent.subject,
            recipient
          );
          const personalizedBody = replaceParameters(
            emailContent.body,
            recipient
          );

          return {
            email: recipient.email,
            subject: personalizedSubject,
            body: personalizedBody,
          };
        })
        .filter(Boolean);

      if (failedEmails.length === 0) {
        clearInterval(progressInterval);
        setError("No valid email addresses found to retry.");
        setSending(false);
        return;
      }

      // Send to our API endpoint
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: failedEmails,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send emails");
      }

      const data = await response.json();

      // Update results
      setResults({
        successful: [...results.successful, ...data.results.successful],
        failed: data.results.failed,
        total: results.total,
      });

      setProgress(100);
    } catch (err: any) {
      setError(`There was an error retrying the emails: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-color1 text-white">
        <h2 className="text-xl font-bold mb-2">Send Broadcast</h2>
        <p className="text-sm text-color1lite">
          Review and send your email to {selectedRecipients.length} recipient
          {selectedRecipients.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-6">
        {!sent ? (
          <>
            {/* Confirmation Card */}
            <motion.div
              className="bg-color3lite rounded-lg p-6 mb-6 border border-color3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start">
                <div className="bg-color3 rounded-full p-2 mr-4">
                  <svg
                    className="w-6 h-6 text-color1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-color1 mb-2">
                    Confirm Broadcast
                  </h3>
                  <p className="text-sm text-color1/80 mb-4">
                    You&apos;re about to send an email with the subject &quot;
                    <span className="font-medium">
                      {emailContent.subject}
                    </span>{" "}
                    &quot; to{" "}
                    <span className="font-medium">
                      {selectedRecipients.length}{" "}
                      {selectedRecipients[0]?.type === "rider"
                        ? "rider"
                        : "customer"}
                      {selectedRecipients.length !== 1 ? "s" : ""}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-color1/80">
                    This action cannot be undone. Are you sure you want to
                    proceed?
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium mb-3">Email Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Recipients</div>
                  <div className="font-medium">
                    {selectedRecipients.length}{" "}
                    {selectedRecipients[0]?.type === "rider"
                      ? "rider(s)"
                      : "customer(s)"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Subject</div>
                  <div className="font-medium truncate">
                    {emailContent.subject}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Template</div>
                  <div className="font-medium capitalize">
                    {emailContent.template || "Custom Email"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Estimated Delivery</div>
                  <div className="font-medium">Within a few minutes</div>
                </div>
              </div>
            </div>

            {/* Recipient List Preview */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Recipients Preview</h3>
                <span className="text-xs text-gray-500">
                  {selectedRecipients.length} total
                </span>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="max-h-32 overflow-y-auto">
                  {selectedRecipients.slice(0, 5).map((recipient, index) => (
                    <motion.div
                      key={recipient.id}
                      className="px-3 py-2 flex justify-between items-center border-b last:border-b-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {recipient.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {recipient.email}
                        </div>
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                        {recipient.status}
                      </div>
                    </motion.div>
                  ))}

                  {selectedRecipients.length > 5 && (
                    <div className="px-3 py-2 text-center text-sm text-gray-500 border-t">
                      +{selectedRecipients.length - 5} more recipients
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Send Progress */}
            {sending && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span>Sending emails...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div
                    className="bg-color2 h-2.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-between">
              <motion.button
                className={`px-5 py-2 bg-color1lite text-color1 rounded-lg ${
                  sending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={
                  sending
                    ? {}
                    : {
                        scale: 1.02,
                        backgroundColor: "rgba(180, 217, 255, 0.8)",
                      }
                }
                whileTap={sending ? {} : { scale: 0.98 }}
                onClick={onBack}
                disabled={sending}
              >
                Back
              </motion.button>

              <motion.button
                className={`px-6 py-2 bg-color2 text-white rounded-lg shadow-sm flex items-center ${
                  sending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={
                  sending
                    ? {}
                    : {
                        scale: 1.02,
                        boxShadow: "0 4px 10px rgba(126, 168, 82, 0.3)",
                      }
                }
                whileTap={sending ? {} : { scale: 0.98 }}
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Broadcast
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 bg-color2/20 rounded-full flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            >
              <svg
                className="w-10 h-10 text-color2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <motion.h3
              className="text-2xl font-bold text-color1 mb-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Broadcast Sent Successfully!
            </motion.h3>

            <motion.p
              className="text-gray-600 mb-4 text-center max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your email has been sent to {results?.successful.length || 0} out
              of {results?.total || selectedRecipients.length}{" "}
              {selectedRecipients[0]?.type === "rider" ? "rider" : "customer"}
              {selectedRecipients.length !== 1 ? "s" : ""}.
            </motion.p>

            {results?.failed && results.failed.length > 0 && (
              <motion.div
                className="mb-4 w-full max-w-md bg-red-50 p-3 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-red-700 font-medium mb-2">
                  {results.failed.length} email(s) failed to send:
                </p>
                <ul className="text-xs text-red-600 list-disc pl-5 max-h-24 overflow-y-auto">
                  {results.failed.slice(0, 5).map((failure, i) => (
                    <li key={i}>
                      {failure.email}: {failure.reason}
                    </li>
                  ))}
                  {results.failed.length > 5 && (
                    <li>...and {results.failed.length - 5} more</li>
                  )}
                </ul>
              </motion.div>
            )}

            {/* Confetti Animation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2 }}
            >
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor:
                      i % 5 === 0
                        ? "#7EA852"
                        : i % 5 === 1
                        ? "#FAE27C"
                        : i % 5 === 2
                        ? "#DBE64C"
                        : i % 5 === 3
                        ? "#001F3E"
                        : "#A4C3A2",
                  }}
                  initial={{
                    top: "50%",
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    top: `${10 + Math.random() * 30}%`,
                    scale: Math.random() * 2 + 0.5,
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
              <motion.div
                className="bg-color1lite/20 p-4 rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-3xl font-bold text-color1">
                  {results?.total || selectedRecipients.length}
                </div>
                <div className="text-sm text-gray-600">Recipients</div>
              </motion.div>

              <motion.div
                className="bg-color3lite p-4 rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl font-bold text-color1">
                  {results?.successful
                    ? Math.round(
                        (results.successful.length / results.total) * 100
                      )
                    : 100}
                  %
                </div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </motion.div>

              <motion.div
                className="bg-color4lite p-4 rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-3xl font-bold text-color1">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-sm text-gray-600">Sent At</div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="px-6 py-3 bg-color2 text-white rounded-lg shadow-sm"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 10px rgba(126, 168, 82, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => window.location.reload()}
              >
                Create New Broadcast
              </motion.button>

              {results?.failed && results.failed.length > 0 ? (
                <motion.button
                  className="px-6 py-3 bg-color1lite text-color1 rounded-lg"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(180, 217, 255, 0.8)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleRetry}
                  disabled={sending}
                >
                  {sending ? "Retrying..." : "Retry Failed Emails"}
                </motion.button>
              ) : (
                <motion.button
                  className="px-6 py-3 bg-color1lite text-color1 rounded-lg"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(180, 217, 255, 0.8)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => (window.location.href = "/admin")}
                >
                  Go Back Home
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
