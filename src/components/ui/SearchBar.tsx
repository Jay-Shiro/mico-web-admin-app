"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`flex items-center relative rounded-full border ${
        isFocused ? "border-color1 ring-2 ring-color1/20" : "border-gray-300"
      } bg-white overflow-hidden transition-all duration-200`}
    >
      <div className="pl-3 pr-2">
        <svg
          className={`w-5 h-5 ${
            isFocused ? "text-color1" : "text-gray-400"
          } transition-colors duration-200`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        className="w-full py-2 px-2 outline-none text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <motion.button
          className="pr-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange("")}
        >
          <svg
            className="w-5 h-5 text-gray-400 hover:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default SearchBar;
