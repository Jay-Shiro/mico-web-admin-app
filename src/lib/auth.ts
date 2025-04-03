import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Both username and password are required");
          }

          const formData = new URLSearchParams();
          formData.append("username", credentials.username.toLowerCase());
          formData.append("password", credentials.password);

          const res = await fetch(
            `${process.env.NEXT_API_BASE_URL}/admin/signin`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
              },
              body: formData,
              cache: "no-store",
            }
          );

          const data = await res.json();

          if (res.status === 401) {
            throw new Error("Invalid username or password");
          }

          if (res.status === 422) {
            const errorMsg = data.detail?.[0]?.msg || "Validation error";
            throw new Error(errorMsg);
          }

          if (!res.ok) {
            throw new Error("An error occurred during sign in");
          }

          if (!data.admin) {
            throw new Error("No admin data in response");
          }

          if (res.ok && data.status === "success") {
            return {
              id: data.admin._id,
              email: data.admin.email,
              username: data.admin.username,
              role: data.admin.role,
            };
          }

          throw new Error("Invalid response format");
        } catch (error: any) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};