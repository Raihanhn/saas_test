// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";
import AdminProfile from "@/core/adminProfile/adminProfile.model";
import bcrypt from "bcryptjs";

connectDB();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user || !user.password) {
          return null;
        }

         if (!user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

           if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          adminId:
            user.role === "admin"
              ? user._id.toString()
              : user.createdBy?.toString(),
          image: user.profileImage || null,
        };
      },
    }),

    CredentialsProvider({
      id: "token-login",
      name: "Token Login",
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        if (!credentials?.token) return null;

         const user = await User.findOne({
          loginToken: credentials.token,
          loginTokenExpiry: { $gt: new Date() },
        });

        if (!user || !user.isActive) return null;

        user.loginToken = undefined;
        user.loginTokenExpiry = undefined;
        await user.save();

        return {
           id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          adminId:
            user.role === "admin"
              ? user._id.toString()
              : user.createdBy?.toString(),
          image: user.profileImage || null,
        };
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user, trigger, session }) {
     if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.name = (user as any).name;
        token.image = (user as any).image;
        token.adminId = (user as any).adminId;
      }

    if (trigger === "update" && session?.user?.image) {
      token.image = session.user.image;
    }

      return token;
  },

  async session({ session, token }) {
    if (!session.user) return session;

    
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).name = token.name;
      (session.user as any).image = token.image; 
      (session.user as any).adminId = token.adminId;

  if (token.role === "admin") {
    const profile = await AdminProfile.findOne({
      userId: token.id,
    })
      .select("logo")
      .lean<{ logo?: string }>();

    (session.user as any).image = profile?.logo || null;
  } else {
    (session.user as any).image = token.image;
  }
    
    return session;
  },
},
  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
