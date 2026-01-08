// modules/clients/ui/ClientForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";

interface ClientFormProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  editingClient?: any;
  clearEdit?: () => void;
}

export default function ClientForm({
  onCreated,
  onUpdated,
  editingClient,
  clearEdit,
}: ClientFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email);
      setPassword("");
    }
  }, [editingClient]);

  const handleSubmit = async () => {
    if (!name || !email || (!editingClient && !password)) {
      setError("All required fields missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (editingClient) {
        await axios.put(`/api/clients/${editingClient._id}`, {
          name,
          email,
        });
        onUpdated?.();
        clearEdit?.();
      } else {
        await axios.post("/api/clients", { name, email, password });
        onCreated?.();
      }

      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div  className={`p-6 rounded-xl shadow transition-colors ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
            className={`border rounded-lg px-4 py-2 focus:outline-none transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
            className={`border rounded-lg px-4 py-2 focus:outline-none transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
        />
        {!editingClient && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              className={`border rounded-lg px-4 py-2 focus:outline-none transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`
           text-white transition transform hover:scale-105 cursor-pointer px-6 py-2 rounded-lg 
            ${theme === "dark" ? "bg-gray-900" : " bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800"} ` }
        >
          {loading
            ? "Saving..."
            : editingClient
            ? "Update Client"
            : "Create Client"}
        </button>

        {editingClient && (
          <button
            onClick={clearEdit}
             className={`px-6 py-2 rounded-lg cursor-pointer transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
