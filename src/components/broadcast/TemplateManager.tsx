"use client";

import { motion } from "framer-motion";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface TemplateManagerProps {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (template: Template) => void;
}

export default function TemplateManager({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateManagerProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            className={`cursor-pointer border rounded-lg p-3 ${
              selectedTemplate === template.id
                ? "border-color2 bg-color2/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onClick={() => onSelectTemplate(template)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-color1">
                {template.name}
              </h4>
              {selectedTemplate === template.id && (
                <div className="bg-color2/20 text-color2 text-xs px-2 py-0.5 rounded">
                  Selected
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mb-2">
              Subject: {template.subject}
            </p>
            <div className="text-xs text-gray-500 line-clamp-2 h-8 overflow-hidden">
              {template.body.replace(/<[^>]*>/g, "")}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
