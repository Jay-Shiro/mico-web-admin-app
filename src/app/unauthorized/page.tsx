"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Unauthorized = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof window !== "undefined") {
        router.push("/");
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [router]);

  const handleRedirect = () => {
    if (typeof window !== "undefined") {
      router.push("/");
    }
  };

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 font-sans text-center overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-pulse-slow bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:40px_40px] opacity-10"></div>
      </div>

      {/* Content Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10"
      >
        {/* Icon */}
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-color4 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-14a4 4 0 00-4 4v2h8V9a4 4 0 00-4-4z"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-color4 drop-shadow-lg mb-4">
          Unauthorized Access
        </h1>
        <p className="text-color3lite text-lg max-w-xl mb-8">
          You don’t have permission to view this page.
          <br />
          Redirecting you to the homepage...
        </p>

        {/* Manual Redirect Option */}
        <button
          onClick={handleRedirect}
          className="bg-color4 text-color1 px-6 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-color4lite transition duration-300 shadow-md hover:shadow-lg"
        >
          Return Home Now
        </button>
      </motion.div>
    </main>
  );
};

export default Unauthorized;
