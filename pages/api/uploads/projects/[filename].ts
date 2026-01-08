//pages/api/uploads/projects/[filename].ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import mime from "mime"; 

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename, view } = req.query;
  if (!filename) return res.status(400).end("Filename required");

  const filePath = path.join(process.cwd(), "uploads/projects", filename as string);
  if (!fs.existsSync(filePath)) return res.status(404).end("File not found");

  const mimeType = mime.getType(filePath) || "application/octet-stream";

  if (view === "true") {
    res.setHeader("Content-Type", mimeType);
  } else {
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
  }

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
