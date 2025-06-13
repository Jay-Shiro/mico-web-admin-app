"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import RecipientSelector from "@/components/broadcast/RecipientSelector";
import EmailComposer from "@/components/broadcast/EmailComposer";
import EmailPreview from "@/components/broadcast/EmailPreview";
import SendPanel from "@/components/broadcast/SendPanel";

export default function BroadcastPage() {
  const [step, setStep] = useState<"select" | "compose" | "preview" | "send">(
    "select"
  );
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  const [emailContent, setEmailContent] = useState({
    subject: "",
    body: "",
    template: "default",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const proceedToCompose = () => {
    if (selectedRecipients.length > 0) {
      setStep("compose");
    }
  };

  const proceedToPreview = () => {
    setStep("preview");
  };

  const proceedToSend = () => {
    setStep("send");
  };

  return (
    <div className="min-h-screen bg-color1lite/10">
      {/* Header */}
      <div className="bg-color1 text-white py-4 px-6 shadow-lg">
        <motion.h1
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Broadcast Messaging System
        </motion.h1>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="container mx-auto py-8 px-4">
        {/* Progress Indicators */}
        <div className="mb-8">
          <motion.div className="flex justify-between relative z-10">
            {["Recipients", "Compose", "Preview", "Send"].map(
              (label, index) => {
                const stepValue = ["select", "compose", "preview", "send"][
                  index
                ];
                const isActive = step === stepValue;
                const isPast =
                  (step === "compose" && index === 0) ||
                  (step === "preview" && index < 2) ||
                  (step === "send" && index < 3);

                return (
                  <motion.div
                    key={label}
                    className={`flex flex-col items-center ${
                      isActive ? "z-20" : ""
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-2
                      ${
                        isActive
                          ? "bg-color2 scale-110"
                          : isPast
                          ? "bg-color4"
                          : "bg-color1lite"
                      }`}
                      initial={false}
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0px 0px 0px rgba(0,0,0,0)",
                                "0px 0px 20px rgba(126, 168, 82, 0.5)",
                                "0px 0px 10px rgba(126, 168, 82, 0.3)",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {isPast ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </motion.div>
                    <span
                      className={`text-sm ${
                        isActive
                          ? "font-bold text-color2"
                          : isPast
                          ? "text-color4"
                          : "text-color1"
                      }`}
                    >
                      {label}
                    </span>
                  </motion.div>
                );
              }
            )}
          </motion.div>

          {/* Progress Line */}
          <div
            className="relative h-1 bg-color1lite/30 -mt-20 mx-auto"
            style={{ width: "70%", margin: "0 auto" }}
          >
            <motion.div
              className="absolute h-1 bg-color2"
              initial={{ width: "0%" }}
              animate={{
                width:
                  step === "select"
                    ? "0%"
                    : step === "compose"
                    ? "33%"
                    : step === "preview"
                    ? "66%"
                    : "100%",
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Recipients */}
          <motion.div
            className={`w-full lg:w-1/3 ${
              step !== "select" && step !== "compose" ? "lg:hidden" : ""
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RecipientSelector
              selectedRecipients={selectedRecipients}
              setSelectedRecipients={setSelectedRecipients}
              onContinue={proceedToCompose}
              isActive={step === "select"}
            />
          </motion.div>

          {/* Right Panel - Content Changes Based on Step */}
          <motion.div
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {step === "select" && (
              <div className="flex h-full items-center justify-center">
                <motion.div
                  className="text-center p-10 rounded-2xl bg-white shadow-xl max-w-md"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <h2 className="text-2xl font-bold text-color1 mb-4">
                    Start Your Broadcast
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Select riders or customers from the left panel to begin
                    crafting your message.
                  </p>
                  <div className="text-5xl mb-6 text-color2">
                    <svg
                      className="w-24 h-24 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your message will reach {selectedRecipients.length}{" "}
                    recipient(s) once sent.
                  </p>
                </motion.div>
              </div>
            )}

            {step === "compose" && (
              <EmailComposer
                emailContent={emailContent}
                setEmailContent={setEmailContent}
                selectedRecipients={selectedRecipients}
                onPreview={() => setShowPreview(!showPreview)}
                showPreview={showPreview}
                onContinue={proceedToPreview}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
            )}

            {step === "preview" && (
              <EmailPreview
                emailContent={emailContent}
                selectedRecipients={selectedRecipients}
                onBack={() => setStep("compose")}
                onContinue={proceedToSend}
              />
            )}

            {step === "send" && (
              <SendPanel
                emailContent={emailContent}
                selectedRecipients={selectedRecipients}
                onBack={() => setStep("preview")}
                selectedImage={selectedImage}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
