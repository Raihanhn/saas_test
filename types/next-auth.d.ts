// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "client";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "admin" | "client";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "client";
  }
}
