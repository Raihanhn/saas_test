import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import User from "@/core/user/user.model";
import AdminProfile from "@/core/adminProfile/adminProfile.model";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

connectDB();

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: err.message });

    if (!fields.data)
      return res.status(400).json({ message: "No data provided" });

    let data;
    try {
      const rawData = Array.isArray(fields.data)
        ? fields.data[0]
        : (fields.data as string);
      data = JSON.parse(rawData);
    } catch (parseErr) {
      return res.status(400).json({ message: "Invalid JSON data" });
    }

    const role = (session.user as any).role;

    try {
      let logoPath: string | null = null;
      if (files.profileImage) {
        const file = Array.isArray(files.profileImage)
          ? (files.profileImage[0] as File)
          : (files.profileImage as File);

        const originalName = file.originalFilename || "unknown.png";
        const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        // const uploadDir = path.join(process.cwd(), "public/uploads/profiles");
        const uploadDir = "/tmp/uploads/profiles";
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });

        const dest = path.join(uploadDir, fileName);
        fs.copyFileSync(file.filepath, dest);

        logoPath = "/uploads/profiles/" + fileName;
      }

      if (role === "admin") {
        const profile = await AdminProfile.findOne({
          userId: (session.user as any).id,
        });
        if (!profile)
          return res.status(404).json({ message: "Profile not found" });

        Object.assign(profile, data);
        if (logoPath) profile.logo = logoPath;

        await profile.save();
      } else {
        const user = await User.findById((session.user as any).id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (role !== "admin") {
          delete data.email; 
        }

        Object.assign(user, data);
        if (logoPath) (user as any).profileImage = logoPath;

        await user.save();
      }

      return res.status(200).json({
        message: "Profile updated successfully",
         image: logoPath || null, 
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Server error" });
    }
  });
}
