"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TemplateManager from "./TemplateManager";
import ParameterInsert from "./ParameterInsert";
import { Editor } from "@tinymce/tinymce-react";
import Image from "next/image";

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
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
};

export default function EmailComposer({
  emailContent,
  setEmailContent,
  selectedRecipients,
  onPreview,
  showPreview,
  onContinue,
  selectedImage,
  setSelectedImage,
}: EmailComposerProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // Update image preview when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setImagePreview(objectUrl);

      // Cleanup function to revoke the object URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
      // Also clean up any blob URLs in the editor content when image is removed
      if (editorRef.current) {
        const content = editorRef.current.getContent();
        const cleanedContent = content.replace(
          /<img[^>]*data-image-placeholder="true"[^>]*>/g,
          ""
        );
        if (cleanedContent !== content) {
          editorRef.current.setContent(cleanedContent);
        }
      }
    }
  }, [selectedImage]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Insert a placeholder that will be replaced with CID reference during email sending
      if (editorRef.current) {
        const objectUrl = URL.createObjectURL(file);
        const imgTag = `<img src="${objectUrl}" alt="Attachment" style="max-width:100%;border-radius:8px;margin:8px 0;" data-image-placeholder="true" />`;
        editorRef.current.insertContent(imgTag);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    // Remove the image from the editor content
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      // Remove images with data-image-placeholder attribute
      const updatedContent = content.replace(
        /<img[^>]*data-image-placeholder="true"[^>]*>/g,
        ""
      );
      editorRef.current.setContent(updatedContent);
    }
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
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-color1 mb-3">
            Attach Image (optional)
          </label>

          {/* Modern Styled File Input */}
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="image-upload"
            />
            <motion.label
              htmlFor="image-upload"
              className="relative flex items-center justify-center gap-4 px-8 py-6 bg-gradient-to-br from-color2/90 via-color3/80 to-color4/90 text-color1 rounded-2xl cursor-pointer border-2 border-dashed border-color2/40 hover:border-color2/70 transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              {/* Upload Icon with Animation */}
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg
                  className="w-8 h-8 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>

              {/* Text with Improved Typography */}
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide drop-shadow-sm">
                  {selectedImage ? "Change Image" : "Choose Image"}
                </span>
                <span className="text-sm opacity-80 mt-1">
                  PNG, JPG up to 10MB
                </span>
              </div>

              {/* Sparkle Effect */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-60"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white rounded-full opacity-40"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </motion.label>
          </div>

          {/* Enhanced Image Preview */}
          {imagePreview && (
            <motion.div
              className="mt-6 p-6 bg-gradient-to-br from-color3lite via-white to-color3lite/50 rounded-2xl border-2 border-color3/30 shadow-xl"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-start gap-6">
                {/* Image with Enhanced Styling */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-color2/20 to-color4/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={320}
                    height={160}
                    className="relative max-h-40 rounded-xl border-3 border-white object-contain shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {/* Image Frame Effect */}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-color2/20 ring-offset-2 ring-offset-white/50" />
                </div>

                {/* Enhanced Info Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-lg font-bold text-color1">
                      Image Attached
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-color2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium text-color1">
                        {selectedImage?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-color2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                        />
                      </svg>
                      <span className="text-color1/80">
                        {selectedImage
                          ? (selectedImage.size / 1024).toFixed(1)
                          : 0}{" "}
                        KB
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-color2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-green-600 font-medium">
                        Ready for inline embedding
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Remove Button */}
                  <motion.button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </motion.svg>
                    Remove Image
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

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
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
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
