"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminModal from "@/app/(dashboard)/settings/AdminModal";

interface Admin {
  _id: string;
  username: string;
  role: string;
  email: string;
  date_joined: string;
}

const ROLES = ["admin", "support", "account"];
const version = "1.0.0";

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "support",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const toastId = toast.loading("Loading admins...");
    setLoading(true);
    try {
      const res = await fetch("/api/admins");
      const data = await res.json();
      setAdmins(data.admins || []);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error("Failed to fetch admins", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsAddingAdmin(false);
    setEditingAdmin(null);
    setFormData({ username: "", email: "", password: "", role: "support" });
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    setDeletingAdminId(adminId);
    const toastId = toast.loading("Deleting admin...");

    try {
      const res = await fetch(`/api/admins/${adminId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      toast.success(data.message || "Admin deleted successfully", {
        id: toastId,
      });
      await fetchAdmins();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete admin", { id: toastId });
    } finally {
      setDeletingAdminId(null);
    }
  };

  const handleRoleChange = async (adminId: string, newRole: string) => {
    setUpdatingAdminId(adminId);
    const toastId = toast.loading("Updating role...");

    try {
      const payload = { role: newRole.toLowerCase() };
      const res = await fetch(`/api/admins/${adminId}/change-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      toast.success("Role updated successfully", { id: toastId });
      await fetchAdmins();
    } catch (error: any) {
      console.error("Role change error:", error);
      toast.error(error.message || "Failed to update role", { id: toastId });
    } finally {
      setUpdatingAdminId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["username", "role", "email", "password"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    const toastId = toast.loading("Creating admin...");
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      toast.success("Admin created successfully", { id: toastId });
      handleModalClose();
      await fetchAdmins();
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create admin", { id: toastId });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const updates = new URLSearchParams();
    let hasUpdates = false;

    if (
      formData.username.trim() &&
      formData.username.trim() !== editingAdmin.username
    ) {
      updates.append("username", formData.username.trim());
      hasUpdates = true;
    }

    if (formData.email.trim() && formData.email.trim() !== editingAdmin.email) {
      updates.append("email", formData.email.trim());
      hasUpdates = true;
    }

    if (formData.password) {
      updates.append("password", formData.password);
      hasUpdates = true;
    }

    if (formData.role && formData.role !== editingAdmin.role) {
      updates.append("role", formData.role);
      hasUpdates = true;
    }

    if (!hasUpdates) {
      toast.error("No changes to update");
      return;
    }

    try {
      const toastId = toast.loading("Updating admin...");

      const res = await fetch(`/api/admins/${editingAdmin._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: updates.toString(),
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if (!res.ok) {
        throw new Error(data.error || "Failed to update admin");
      }

      toast.success("Admin updated successfully");
      handleModalClose();
      await fetchAdmins();
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.message || "Update failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-color1">Admin Settings</h1>
          <p className="text-sm text-gray-500">
            Manage roles, access, and more.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Version {version}</span>
          <button
            onClick={() => setIsAddingAdmin(true)}
            className="bg-color1 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition"
          >
            + Add Admin
          </button>
        </div>
      </div>

      <div className="bg-red backdrop-blur-md rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-color3">
            <tr>
              {["Username", "Email", "Role", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-xs font-semibold text-color1 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-color1">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-color1 rounded-full animate-bounce" />
                    <div className="w-4 h-4 bg-color1 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-4 h-4 bg-color1 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-color1/20">
                  <td className="px-6 py-4">{admin.username}</td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={admin.role}
                      onChange={(e) =>
                        handleRoleChange(admin._id, e.target.value)
                      }
                      disabled={updatingAdminId === admin._id}
                      className={`px-3 py-1.5 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all ${
                          updatingAdminId === admin._id ? "opacity-50" : ""
                        }`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="py-2">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => {
                        setEditingAdmin(admin);
                        setFormData({
                          username: admin.username,
                          email: admin.email,
                          password: "",
                          role: admin.role,
                        });
                      }}
                      className="text-color1 hover:underline disabled:opacity-50"
                      disabled={
                        deletingAdminId === admin._id ||
                        updatingAdminId === admin._id
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
                      className={`text-red-500 hover:underline disabled:opacity-50 
                        ${
                          deletingAdminId === admin._id ? "animate-pulse" : ""
                        }`}
                      disabled={
                        deletingAdminId === admin._id ||
                        updatingAdminId === admin._id
                      }
                    >
                      {deletingAdminId === admin._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddingAdmin && (
        <AdminModal
          mode="add"
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {editingAdmin && (
        <AdminModal
          mode="edit"
          admin={editingAdmin}
          onClose={handleModalClose}
          onSubmit={handleUpdate}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
}
