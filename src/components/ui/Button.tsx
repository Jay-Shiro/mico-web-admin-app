"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  icon,
  iconPosition = "left",
}: ButtonProps) {
  // Base styles for all buttons
  const baseStyles =
    "rounded-lg font-medium flex items-center justify-center transition-all";

  // Size styles
  const sizeStyles = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-5",
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-color2 text-white hover:bg-color2/90 shadow-sm",
    secondary: "bg-color1lite text-color1 hover:bg-color1lite/80",
    outline: "border-2 border-color1 text-color1 hover:bg-color1/5",
    ghost: "text-color1 hover:bg-color1/5",
  };

  // Disabled styles
  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Combined styles
  const styles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  // Animation properties
  const animations = disabled
    ? {}
    : {
        whileHover: {
          scale: 1.02,
          transition: { duration: 0.2 },
        },
        whileTap: {
          scale: 0.98,
        },
      };

  return (
    <motion.button
      className={styles}
      onClick={onClick}
      disabled={disabled}
      {...animations}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
}
