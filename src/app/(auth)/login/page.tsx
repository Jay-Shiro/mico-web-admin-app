"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/admin");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (!res?.ok) {
        setError(`Login failed: ${res?.error || "Invalid credentials"}`);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error: any) {
      setError(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-[400px] p-8 bg-white rounded-2xl shadow-xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-color1 text-transparent bg-clip-text">
            MICO<span className="text-xs">admin</span>
          </h1>
          <p className="text-slate-600 mt-2">Welcome back</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="w-full p-4 bg-slate-100 rounded-xl"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-4 bg-slate-100 rounded-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-color1 text-white rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
