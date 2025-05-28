import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface AdminModalProps {
  mode: "add" | "edit";
  admin?: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const AdminModal = ({
  mode,
  admin,
  onClose,
  onSubmit,
  formData,
  setFormData,
}: AdminModalProps) => {
  useEffect(() => {
    if (mode === "edit" && admin) {
      setFormData({
        username: admin.username,
        email: admin.email,
        role: admin.role,
        password: "",
      });
    }
  }, [mode, admin, setFormData]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md px-6 py-8"
      >
        <h2 className="text-2xl font-bold text-color1 mb-6">
          {mode === "add" ? "Add New Admin" : "Edit Admin"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-color1/50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-color/50"
            />
          </div>

          {/* Password (Only in Add Mode) */}
          {mode === "add" && (
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-color1/50"
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                bg-white/70 focus:outline-none focus:ring-2 focus:ring-color1/50 
                cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                bg-no-repeat bg-[center_right_1rem] bg-[length:1rem] pr-10 
                hover:border-color1 transition-all"
            >
              {["admin", "support", "account"].map((role) => (
                <option
                  key={role}
                  value={role}
                  className="py-2 px-3 hover:bg-gray-100"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-color1 hover:scale-105 transition-transform"
            >
              {mode === "add" ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminModal;
