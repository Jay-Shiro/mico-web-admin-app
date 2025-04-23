"use client";

import { motion } from "framer-motion";

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

const Checkbox = ({ checked, onChange, disabled = false }: CheckboxProps) => {
  return (
    <div
      className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer
      ${
        checked
          ? "bg-color1 border-color1"
          : "bg-white border-gray-300 hover:border-color1"
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={() => !disabled && onChange()}
    >
      {checked && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      )}
    </div>
  );
};

export default Checkbox;
