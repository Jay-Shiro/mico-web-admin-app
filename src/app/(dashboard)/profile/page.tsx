"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    username: session?.user?.username || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      // Create form data with only modified fields
      const updates = new URLSearchParams();

      if (formData.username.trim() !== session?.user?.username) {
        updates.append("username", formData.username.trim());
      }
      if (formData.email.trim() !== session?.user?.email) {
        updates.append("email", formData.email.trim());
      }
      if (formData.currentPassword && formData.newPassword) {
        updates.append("current_password", formData.currentPassword);
        updates.append("new_password", formData.newPassword);
      }

      // Only proceed if there are actual changes
      if (Array.from(updates.entries()).length === 0) {
        toast.error("No changes to update");
        return;
      }

      const res = await fetch(`/api/admins/${session?.user?.id}/delete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: updates.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    setUploadingImage(true);
    setTimeout(() => {
      toast.success("Profile picture updated!");
      setUploadingImage(false);
    }, 2000); // simulate upload
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-color1 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500">
            Manage and secure your personal info
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-color1/10 text-color1 hover:bg-color1/20 transition-all shadow-sm"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border">
          <div className="flex flex-col items-center relative">
            <div className="relative w-28 h-28 mb-4 group">
              <Image
                src="/avatar.png"
                alt="Profile"
                fill
                className="rounded-full object-cover ring-4 ring-color1/10"
              />
              {isEditing && (
                <button
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 p-2 bg-color1 text-white rounded-full shadow-md hover:scale-105 transition-all"
                  title="Upload new picture"
                >
                  {uploadingImage ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m0 0A7.5 7.5 0 1112 19.5V19"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 19.121a1.5 1.5 0 102.121 2.121l14-14a1.5 1.5 0 00-2.121-2.121l-14 14z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {session?.user?.username}
            </h2>
            <span className="px-3 py-1 bg-color1/10 text-color1 rounded-full text-xs mt-2 font-medium tracking-wide uppercase">
              {session?.user?.role}
            </span>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-color1 focus:outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-color1 focus:outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Change Password
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                          disabled={isLoading}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-color1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.current ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPassword: e.target.value,
                            })
                          }
                          disabled={isLoading}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-color1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.new ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          disabled={isLoading}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-color1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.confirm ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-color1 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
