"use client";

import React from "react";

const Homepage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-color1 to-color1lite flex flex-col items-center justify-center text-white font-sans px-6">
      {/* Hero Section */}
      <section className="text-center mb-20 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-xl leading-tight">
          Mico <span className="text-color4">Admin</span>
        </h1>
        <p className="text-lg sm:text-xl mt-4 max-w-2xl mx-auto text-color3lite">
          Log in to manage admin tasks
        </p>
      </section>

      {/* Login Card */}
      <section className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-semibold text-center text-color1 mb-4">
          Admin Login
        </h2>
        <p className="text-center text-white mb-6">
          Click below to access, filtered by your admin role
        </p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-color1 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-color4lite transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color4"
        >
          Login
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-sm text-color3lite text-center animate-fade-in-down">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Mico Admin</span>. All rights
          reserved.
        </p>
      </footer>
    </main>
  );
};

export default Homepage;
