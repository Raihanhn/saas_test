// modules/projects/ui/ProjectForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";

interface ProjectFormProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  editingProject?: any;
  clearEdit?: () => void;
  clients: any[];
}

export default function ProjectForm({
  onCreated,
  onUpdated,
  editingProject,
  clearEdit,
  clients,
}: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    | "TO DO"
    | "PLANNING"
    | "IN PROGRESS"
    | "REVIEW"
    | "CHANGES REQUIRED"
    | "COMPLETE"
    | "CANCELLED"
  >("TO DO");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || "");
      setStatus(editingProject.status);
      setClientId(editingProject.clientId?._id || "");
      setStartDate(editingProject.startDate?.slice(0, 10) || "");
      setEndDate(editingProject.endDate?.slice(0, 10) || "");
      setPrice(editingProject.price || 0);
      setErrors({});
    }
  }, [editingProject]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Project Name is required";
    if (!clientId) newErrors.clientId = "Client selection is required";
    if (!status) newErrors.status = "Status is required";
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!endDate) newErrors.endDate = "End Date is required";
    if (!price || price <= 0) newErrors.price = "Price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name, description, status, clientId, startDate, endDate, price };
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject._id}`, payload);
        onUpdated?.();
        clearEdit?.();
      } else {
        await axios.post("/api/projects", payload);
        onCreated?.();
      }
      setName("");
      setDescription("");
      setStatus("TO DO");
      setClientId("");
      setStartDate("");
      setEndDate("");
      setPrice(0);
      setErrors({});
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-8 rounded-2xl border shadow-lg w-full max-w-3xl mx-auto transition-colors ${
        theme === "dark" ? "bg-gray-900 border-emerald-400 text-white border-gray-200 " : "bg-white border-emerald-200 text-gray-900"
      }`}
    >
      <h2 className="text-2xl cursor-pointer font-bold mb-6 text-emerald-600">
        {editingProject ? "Edit Project" : "Create New Project"}
      </h2>

      {errors.general && (
        <p className="text-red-500 mb-4 font-medium">{errors.general}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Project Name */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">Project Name</label>
          <input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : theme === "dark"
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-emerald-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-500"
            }`}
          />
          {errors.name && <p className="absolute text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Client Select */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={role !== "admin"}
            className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition ${
              errors.clientId
                ? "border-red-500 focus:ring-red-500"
                : theme === "dark"
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-emerald-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-500"
            }`}
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="absolute text-red-500 text-xs mt-1">{errors.clientId}</p>}
        </div>

        {/* Status */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition ${
              errors.status
                ? "border-red-500 focus:ring-red-500"
                : theme === "dark"
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-emerald-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-500"
            }`}
          >
            <option value="TO DO">TO DO</option>
            <option value="PLANNING">PLANNING</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="CHANGES REQUIRED">CHANGES REQUIRED</option>
            <option value="COMPLETE">COMPLETE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          {errors.status && <p className="absolute text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        {/* Start Date */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition
            ${errors.startDate ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            ${theme === "dark" ? "bg-gray-800 text-white [&::-webkit-calendar-picker-indicator]:invert" : "bg-white text-gray-900"}
          `}
          />
          {errors.startDate && <p className="absolute text-red-500 text-xs mt-1">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition
            ${errors.startDate ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            ${theme === "dark" ? "bg-gray-800 text-white [&::-webkit-calendar-picker-indicator]:invert" : "bg-white text-gray-900"}
          `}
          />
          {errors.endDate && <p className="absolute text-red-500 text-xs mt-1">{errors.endDate}</p>}
        </div>

        {/* Price */}
        <div className="relative w-full">
          <label className="text-sm font-medium mb-1 block">Price ($)</label>
          <input
            type="number"
            value={price === 0 ? "" : price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Project Price"
             className={`border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition
            ${errors.price ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            ${theme === "dark" ? "bg-gray-800 text-white [&::-webkit-inner-spin-button]:invert [&::-webkit-outer-spin-button]:invert" : "bg-white text-gray-900"}
          `}
          />
          {errors.price && <p className="absolute text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-md w-full sm:w-auto cursor-pointer font-semibold transition transform hover:scale-105 shadow-md hover:shadow-md"
        >
          {loading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
        </button>

        {editingProject && (
          <button
            onClick={clearEdit}
            className={`px-6 py-3 rounded-xl w-full sm:w-auto text-center cursor-pointer font-semibold transition-colors shadow-md hover:shadow-lg ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
