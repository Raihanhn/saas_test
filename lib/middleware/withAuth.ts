// lib/middleware/withAuth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export function withAuth(
  handler: (req: NextApiRequest & { user?: any }, res: NextApiResponse) => any,
  options?: {
    roles?: ("admin" | "client")[];
  }
) {
  return async (req: NextApiRequest & { user?: any }, res: NextApiResponse) => {
    const user = await getAuthUser(req, res);

    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (options?.roles && !options.roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    return handler(req, res);
  };
}
