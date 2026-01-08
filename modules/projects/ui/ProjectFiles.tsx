// modules/projects/ui/ProjectFiles.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Upload, CheckCircle, Download, Eye, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProjectFiles({
  projectId,
  canUpload,
  isAdmin,
}: {
  projectId: string;
  canUpload: boolean;
  isAdmin: boolean;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { theme } = useTheme();

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}?action=files`);
      setFiles(res.data.files);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadSuccess(false);

    try {
      await axios.post(`/api/projects/${projectId}?action=files`, formData);
      fetchFiles();
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      setDeletingFileId(fileId);
      await axios.delete(`/api/projects/files/${fileId}`);
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
    } finally {
      setDeletingFileId(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  return (
    <div
      // className={`mt-6 p-4 rounded-xl shadow-md space-y-4 w-full max-w-3xl mx-auto ${
      //   theme === "dark"
      //     ? "bg-gray-800 text-gray-200"
      //     : "bg-white text-gray-900"
      // }`}
    >
      <h3 className="font-semibold text-lg">Project Files</h3>

       <div className="flex flex-wrap gap-3 items-center">
    {canUpload && (
      <label className="cursor-pointer transition transform hover:scale-105 w-11 h-11 bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 rounded-lg flex items-center justify-center text-white hover:bg-emerald-700 transition">
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) uploadFile(e.target.files[0]);
          }}
        />

        {loading ? (
          <span className="animate-spin text-sm">⏳</span>
        ) : uploadSuccess ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </label>
    )}

    {files.length === 0 && (
      <p className="text-sm text-gray-500 ml-2">No files uploaded</p>
    )}

    {files.map((f, index) => (
      <div
        key={f._id}
        className="flex items-center transition transform hover:scale-105 gap-2 px-3 py-2 border rounded-lg bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 transition"
        style={{ minWidth: "120px" }}
      >
        <span className="text-sm font-medium text-white">
          File {index + 1}
        </span>

        <div className="flex  text-white gap-2">
          <button
            onClick={() =>
              setViewFileUrl(`/uploads/projects/${f.filename}?view=true`)
            }
            title="View"
            className=""
          >
            <Eye className="w-4 h-4 text-white cursor-pointer " />
          </button>

          <a
            href={`/uploads/projects/${f.filename}`}
            download
            title="Download"
            className="text-gray-600 hover:text-emerald-600"
          >
            <Download className="w-4 h-4 text-white " />
          </a>

          {isAdmin && (
            <button
              onClick={() => deleteFile(f._id)}
              disabled={deletingFileId === f._id}
              title="Delete"
              className=" cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-white " />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

      {viewFileUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] relative overflow-hidden">
            <button
              onClick={() => setViewFileUrl(null)}
              className="absolute top-3 right-2 cursor-pointer text-red-600 font-bold text-lg"
            >
              ✕
            </button>

            <iframe src={viewFileUrl} className="w-full h-full" frameBorder="0" />
          </div>
        </div>
      )}
    </div>
  );
}