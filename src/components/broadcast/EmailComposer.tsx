"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TemplateManager from "./TemplateManager";
import ParameterInsert from "./ParameterInsert";
import { Editor } from "@tinymce/tinymce-react";

// Real templates - these would ideally come from a database or API
const TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome",
    subject: "Welcome to Mico!",
    body: "<p>Hello {name},</p><p>We're excited to have you join our platform! Here's some information to get you started with Mico's services.</p><p>If you have any questions or need assistance, our customer support team is always ready to help.</p><p>Best regards,<br>The Mico Team</p>",
  },
  {
    id: "announcement",
    name: "New Feature Announcement",
    subject: "Exciting New Features on Mico",
    body: "<p>Hello {name},</p><p>We're thrilled to announce some exciting new features that are now available on our platform. We've been working hard to enhance your experience with Mico.</p><p>Best regards,<br>The Mico Team</p>",
  },
  {
    id: "reminder",
    name: "Service Reminder",
    subject: "Your Mico Services",
    body: "<p>Hello {name},</p><p>This is a friendly reminder about our services at Mico. We value your business and want to ensure you're getting the most out of our delivery platform.</p><p>Best regards,<br>The Mico Team</p>",
  },
  {
    id: "network",
    name: "Service Interruptions",
    subject: "We are Sorry! Our Server got a little Busy",
    body: "<p>Hello {name},</p><p>We are sorry to inform you that our service is currently down, but we are working rigorously to get it back up, we shall keep you updated</p><p>Best regards,<br>The Mico Team</p>",
  },
  {
    id: "system",
    name: "System Ok",
    subject: "All Systems Operational",
    body: "<p>Hello {name},</p><p>We are excited to inform you that all systems are back, and are now operational, thus, Enjoy!  </p><p>Best regards,<br>The Mico Team</p>",
  },
];

type EmailComposerProps = {
  emailContent: {
    subject: string;
    body: string;
    template: string;
  };
  setEmailContent: (content: any) => void;
  selectedRecipients: any[];
  onPreview: () => void;
  showPreview: boolean;
  onContinue: () => void;
};

export default function EmailComposer({
  emailContent,
  setEmailContent,
  selectedRecipients,
  onPreview,
  showPreview,
  onContinue,
}: EmailComposerProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const editorRef = useRef<any>(null);

  // Set a default template if none is selected and we have recipients
  useEffect(() => {
    if (
      selectedRecipients.length > 0 &&
      !emailContent.body &&
      !emailContent.subject
    ) {
      setEmailContent({
        subject: TEMPLATES[0].subject,
        body: TEMPLATES[0].body,
        template: TEMPLATES[0].id,
      });
    }
  }, [selectedRecipients, emailContent, setEmailContent]);

  const handleSelectTemplate = (template: any) => {
    setEmailContent({
      ...emailContent,
      subject: template.subject,
      body: template.body,
      template: template.id,
    });
    setShowTemplates(false);
  };

  const handleInsertParameter = (param: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(`{${param}}`);
    }
  };

  const handleEditorChange = (content: string) => {
    setEmailContent({
      ...emailContent,
      body: content,
    });
  };

  // Get recipient type to show appropriate parameters
  const recipientType =
    selectedRecipients.length > 0
      ? selectedRecipients[0].type === "rider"
        ? "rider"
        : "customer"
      : "customer";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-color1 text-white">
        <h2 className="text-xl font-bold mb-2">Compose Your Message</h2>
        <p className="text-sm text-color1lite">
          Craft your email to {selectedRecipients.length} recipient
          {selectedRecipients.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-6">
        {/* Template Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-color1">
              Template
            </label>
            <motion.button
              className="text-xs flex items-center text-color2 hover:text-color2/80"
              onClick={() => setShowTemplates(!showTemplates)}
              whileHover={{ scale: 1.05 }}
            >
              <span>
                {showTemplates ? "Hide Templates" : "Choose Template"}
              </span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${
                  showTemplates ? "rotate-180" : ""
                }`}
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
            </motion.button>
          </div>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <TemplateManager
                  templates={TEMPLATES}
                  onSelectTemplate={handleSelectTemplate}
                  selectedTemplate={emailContent.template}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Line */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-color1 mb-2">
            Subject Line
          </label>
          <div className="relative">
            <input
              type="text"
              value={emailContent.subject}
              onChange={(e) =>
                setEmailContent({ ...emailContent, subject: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color2 focus:border-transparent transition-all"
              placeholder="Enter subject line..."
            />
            <div className="absolute right-3 top-2 text-xs text-gray-500">
              {emailContent.subject.length}/100
            </div>
          </div>
        </div>

        {/* Editor and Parameters */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-color1">
              Message Content
            </label>
            <motion.button
              className="text-xs flex items-center text-color2 hover:text-color2/80"
              onClick={() => setShowParameters(!showParameters)}
              whileHover={{ scale: 1.05 }}
            >
              <span>
                {showParameters ? "Hide Parameters" : "Insert Parameters"}
              </span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${
                  showParameters ? "rotate-180" : ""
                }`}
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
            </motion.button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""}
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={emailContent.body}
                onEditorChange={handleEditorChange}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </div>

            <AnimatePresence>
              {showParameters && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                  style={{ minWidth: showParameters ? "200px" : "0" }}
                >
                  <ParameterInsert
                    onInsertParameter={handleInsertParameter}
                    recipientType={recipientType}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
            onClick={onPreview}
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </motion.button>

          <motion.button
            className={`px-5 py-2 bg-color2 text-white rounded-lg shadow-sm ${
              !emailContent.subject || !emailContent.body
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            whileHover={
              !emailContent.subject || !emailContent.body
                ? {}
                : {
                    scale: 1.02,
                    boxShadow: "0 4px 10px rgba(126, 168, 82, 0.3)",
                  }
            }
            whileTap={
              !emailContent.subject || !emailContent.body ? {} : { scale: 0.98 }
            }
            onClick={onContinue}
            disabled={!emailContent.subject || !emailContent.body}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  );
}
