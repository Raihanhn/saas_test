// lib/auth/getAuthUser.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function getAuthUser(req: any, res: any) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return null;
  return session.user;
}
