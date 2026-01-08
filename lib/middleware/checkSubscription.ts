// lib/middleware/checkSubscription.ts
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";

export async function checkSubscription(ctx: any) {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  if (!user.hasCompletedSignup) {
    return { redirect: { destination: "/auth/register", permanent: false } };
  }

  const now = new Date();
  if (user.currentPlan === "free" && user.subscriptionCurrentPeriodEnd) {
    if (now > user.subscriptionCurrentPeriodEnd) {
      return { redirect: { destination: "/auth/register", permanent: false } };
    }
  }

  return { user };
}
