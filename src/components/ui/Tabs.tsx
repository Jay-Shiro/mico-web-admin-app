"use client";

import { useState, ReactNode } from "react";
import { motion } from "framer-motion";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

export default function Tabs({ tabs, defaultTab, className = "" }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTab || tabs[0].id);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex-1 py-3 text-center transition-all relative
              ${
                activeTabId === tab.id
                  ? "text-color2 font-medium"
                  : "text-gray-500 hover:text-color1"
              }`}
          >
            {tab.label}
            {activeTabId === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-color2"
                layoutId="activeTab"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      <div className="py-4">{activeTab.content}</div>
    </div>
  );
}
