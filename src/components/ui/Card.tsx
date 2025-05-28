"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  const baseClassName = "bg-white rounded-xl overflow-hidden shadow-md";
  const hoverEffects = hover ? "cursor-pointer transition-all" : "";

  return (
    <motion.div
      className={`${baseClassName} ${hoverEffects} ${className}`}
      whileHover={
        hover ? { y: -4, boxShadow: "0 12px 20px rgba(0, 31, 62, 0.1)" } : {}
      }
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
