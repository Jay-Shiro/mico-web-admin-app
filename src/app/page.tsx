"use client";

import React from 'react';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Mico Admin</h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage your dashboard efficiently with our powerful tools.
        </p>
      </header>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Admin Login</h2>
        <p className="text-gray-500 mb-6">
          Please log in to access the admin dashboard.
        </p>
        <button
          className="w-full bg-color1 text-white py-2 px-4 rounded-lg hover:bg-color1/80 transition duration-300"
          onClick={() => {
            // Redirect to login page
            window.location.href = '/login';
          }}
        >
          Login
        </button>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 text-gray-500 text-sm">
        © {new Date().getFullYear()} Mico Admin. All rights  reserved.
      </footer>
    </div>
  );
};

export default Homepage;