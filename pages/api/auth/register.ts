// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";
import AdminProfile from "@/core/adminProfile/adminProfile.model";
import Subscription from "@/core/subscription/subscription.model";
import { promises as fsPromises } from "fs";
import formidable from "formidable";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse multipart form data
const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );

// Helper to get single value
const getValue = (value: any) => (Array.isArray(value) ? value[0] : value);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  await connectDB();

  try {
    const { fields, files } = await parseForm(req);

    const fullName = getValue(fields.fullName);
    const email = getValue(fields.email);
    const password = getValue(fields.password);
    const businessName = getValue(fields.businessName);
    const country = getValue(fields.country);
    const currency = getValue(fields.currency);
    const timezone = getValue(fields.timezone);
    const address = getValue(fields.address);
    const phone = getValue(fields.phone);
    const website = getValue(fields.website);
    const plan = getValue(fields.plan) || "free";

    const logoFile: any = Array.isArray(files.logo) ? files.logo[0] : files.logo;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Create user
    const newUser = await User.create({
      name: fullName,
      email,
      password,
      role: "admin",
    });

    let logoFileName: string | null = null;
    if (logoFile && logoFile.filepath) {
      const uploadDir = path.join(process.cwd(), "uploads/logo");
      await fsPromises.mkdir(uploadDir, { recursive: true });

      const ext = path.extname(logoFile.originalFilename || "");
      const fileName = `${newUser._id}${ext}`;
      const destPath = path.join(uploadDir, fileName);

      await fsPromises.copyFile(logoFile.filepath, destPath);
      logoFileName = fileName;
    }

    // Parallel creation of profile and subscription
    const profilePromise = AdminProfile.create({
      userId: newUser._id,
      businessName,
      country,
      currency,
      timezone,
      address,
      phone,
      website,
      logo: logoFileName,
    });

    const subscriptionData: any = {
      userId: newUser._id,
      plan,
      status: plan === "free" ? "trial" : "pending",
      trialEnd: plan === "free" ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : undefined,
    };
    const subscriptionPromise = Subscription.create(subscriptionData);

    // Do not await here if you want faster response (background)
    Promise.all([profilePromise, subscriptionPromise]).catch(console.error);

    // Return immediately for fast frontend redirect
    return res.status(201).json({
      message: "Admin registered successfully",
      userId: newUser._id.toString(),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}
