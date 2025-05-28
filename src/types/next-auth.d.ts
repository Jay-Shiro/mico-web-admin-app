import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    email?: string;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
      role: string;
      email?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    email?: string;
  }
}
