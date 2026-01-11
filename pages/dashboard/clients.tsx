"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ClientForm from "@/modules/clients/ui/ClientForm";
import RequireAuth from "@/components/guards/RequireAuth";
import { MoreVertical, Plus, Search, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ClientsPage() {
  const { theme } = useTheme();

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // pagination
  const itemsPerPage = 4;
  const [page, setPage] = useState(1);

  const getUserAvatar = (id: string) => {
    const avatars = ["user-1.jpeg", "user-2.png", "user-3.jpeg", "user-4.jpeg"];

    // simple hash for stability
    const index =
      id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      avatars.length;

    return `/users/${avatars[index]}`;
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/clients");
      setClients(res.data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="space-y-3">
        <p>Delete this client?</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 bg-emerald-600 text-white rounded"
            onClick={async () => {
              await axios.delete(`/api/clients/${id}`);
              fetchClients();
              toast.dismiss(t.id);
              toast.success("Client deleted");
            }}
          >
            Yes
          </button>
          <button
            className="px-3 py-1 bg-gray-300 rounded cursor-pointer "
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <RequireAuth roles={["admin"]}>
      <DashboardLayout>
        <div className="p-6 space-y-6 h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-semibold">Clients</h1>

            <button
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
              }}
              className={`flex transition transform hover:scale-105 items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-white
               ${
                 theme === "dark"
                   ? "bg-gray-800"
                   : "bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800"
               }
              `}
            >
              <Plus size={16} />
              Add Client
            </button>
          </div>

          {/* Search */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <Search
              size={16}
              className={` ${
                theme === "dark" ? "text-gray-400" : "text-gray-400 "
              } `}
            />
            <input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-400 "
            />
          </div>

          {/* Table */}
          <div
            className={`rounded-xl border overflow-hidden ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <table className="w-full">
              <thead
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <tr>
                  <th className="text-left px-6 py-4">Client</th>
                  <th className="text-left">Email</th>
                  <th className="text-right px-6">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-8 w-8 text-emerald-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <tr
                      key={client._id}
                      className={`border-t ${
                        theme === "dark"
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* <div className={`h-10 w-10 rounded-full
                            ${theme === "dark" ? "bg-gray-900" : "bg-emerald-600"}
                             text-white flex items-center justify-center`}>
                            <User size={16} />
                          </div> */}
                          <div
                            className="h-10 w-10 rounded-full overflow-hidden border
                              border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={getUserAvatar(client._id)}
                              alt={client.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-gray-500">
                              Client Account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="text-sm">{client.email}</td>

                      <td className="px-6 text-right">
                        <div className="relative group inline-block">
                          <button className="p-2 rounded ">
                            <MoreVertical size={16} />
                          </button>

                          <div
                            className={`absolute flex right-5 -mt-8 cursor-pointer  top-full rounded-lg 
                          shadow-lg opacity-0 group-hover:opacity-100 z-50
                           transition pointer-events-none group-hover:pointer-events-auto
                            ${theme === "dark" ? "bg-gray-800" : "bg-white"}
                           `}
                          >
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setShowForm(true);
                              }}
                              className={`block w-full cursor-pointer text-sm px-4 py-2
                                 ${
                                   theme === "dark"
                                     ? "hover:bg-gray-600"
                                     : "hover:bg-gray-100"
                                 }
                                `}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(client._id)}
                              className={`block w-full cursor-pointer text-sm px-4 py-2
                                 ${
                                   theme === "dark"
                                     ? "hover:bg-gray-600"
                                     : "hover:bg-gray-100"
                                 }
                               text-red-500 `}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 text-sm">
              {/* Left info */}
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
              >
                {(page - 1) * itemsPerPage + 1}–
                {Math.min(page * itemsPerPage, filtered.length)} of{" "}
                {filtered.length}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={`px-3 py-1 rounded-lg border transition
          ${
            page === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          ${
            theme === "dark"
              ? "border-gray-600 text-gray-300"
              : "border-gray-300 text-gray-700"
          }`}
                >
                  ←
                </button>

                <span
                  className={`px-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-3 py-1 rounded-lg border transition
          ${
            page === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          ${
            theme === "dark"
              ? "border-gray-600 text-gray-300"
              : "border-gray-300 text-gray-700"
          }`}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* <div className="h-150"></div> */}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`w-full max-w-2xl rounded-xl overflow-hidden ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b flex justify-between items-center
        dark:border-gray-700 border-gray-200"
              >
                <h2 className="text-lg font-semibold">
                  {editingClient ? "Edit Client" : "Add Client"}
                </h2>

                <button
                  onClick={() => {
                    setEditingClient(null);
                    setShowForm(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>

              {/* Form */}
              <div className="p-6">
                <ClientForm
                  editingClient={editingClient}
                  onCreated={() => {
                    fetchClients();
                    setShowForm(false);
                  }}
                  onUpdated={() => {
                    fetchClients();
                    setShowForm(false);
                  }}
                  clearEdit={() => {
                    setEditingClient(null);
                    setShowForm(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RequireAuth>
  );
}
