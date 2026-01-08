"use client";

import { useState, useEffect, ChangeEvent } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import {
  Edit,
  UploadCloud,
  User,
  Globe,
  Phone,
  MapPin,
  Lock,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

interface AdminProfile {
  businessName: string;
  country: string;
  currency: string;
  timezone: string;
  address: string;
  phone: string;
  website: string;
  logo?: string | null;
}

interface UserProfile {
  name: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  profileImage?: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { theme } = useTheme();
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      try {
        if (session.user.role === "admin") {
          const res = await axios.get("/api/profile/admin");
          setAdminProfile(res.data);
        } else {
          const res = await axios.get("/api/profile/client");
          setUserProfile(res.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!session?.user) return;
    const { name, value } = e.target;

    if (session.user.role === "admin" && adminProfile)
      setAdminProfile({ ...adminProfile, [name]: value });

    if (session.user.role === "client" && userProfile)
      setUserProfile({ ...userProfile, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      formData.append(
        "data",
        JSON.stringify(
          session?.user?.role === "admin" ? adminProfile : userProfile
        )
      );

      const res = await axios.put("/api/profile/update", formData);

      if (res.data?.image) {
        await update({
          user: {
            ...session?.user,
            image: res.data.image,
          },
        });
      }

      toast.success("Profile updated successfully");
      setEditing(false);
      setProfileImage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.put("/api/profile/password", passwords);
      toast.success("Password updated");
      setPasswordEditing(false);
      setPasswords({ current: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };
  if (initialLoading || status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <svg
            className="w-12 h-12 text-gray-300 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v10a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </DashboardLayout>
    );
  }
  return (
  <DashboardLayout>
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-500">
          View all your profile details here.
        </p>
      </div>

      {/* MAIN PROFILE CARD */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl border p-6
        ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        {/* LEFT: AVATAR CARD */}
        <div
          className={`flex flex-col items-center justify-center rounded-xl p-6
          ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <div className="relative">
            <img
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : adminProfile?.logo ||
                    userProfile?.profileImage ||
                    "/avatars/avatar.png"
              }
              className="w-40 h-40 rounded-full object-cover border"
              alt="Profile"
            />

            {editing && (
              <label className="absolute bottom-2 right-2 bg-emerald-600 p-2 rounded-full cursor-pointer shadow">
                <UploadCloud size={16} className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <h2 className="mt-4 text-xl font-semibold text-center capitalize ">
            {session?.user?.role === "admin"
              ? adminProfile?.businessName
              : userProfile?.name}
          </h2>

          <p className="text-sm text-gray-500 capitalize ">
            {session?.user?.email}
          </p>
        </div>

        {/* RIGHT: DETAILS CARD */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Bio & other details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ADMIN */}
            {adminProfile &&
              [
                ["Business Name", adminProfile.businessName, "businessName", User],
                ["Country", adminProfile.country, "country", Globe],
                ["Phone", adminProfile.phone, "phone", Phone],
                ["Address", adminProfile.address, "address", MapPin],
              ].map(([label, value, name, Icon]: any) => (
                <div
                  key={name}
                  className={`rounded-xl border p-4
                  ${theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-gray-50 border-gray-200"}`}
                >
                  <label className="text-xs text-gray-500">{label}</label>

                  {editing ? (
                    <input
                      name={name}
                      value={value || ""}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-lg px-3 py-2 border outline-none
                      ${theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300"}`}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Icon size={16} />
                      <span className="capitalize">{value || "-"}</span>
                    </div>
                  )}
                </div>
              ))}

            {/* CLIENT */}
            {userProfile &&
              [
                ["Name", userProfile.name, "name", User],
                ["Email", userProfile.email, "", Mail],
                ["Phone", userProfile.phone, "phone", Phone],
                ["Address", userProfile.address, "address", MapPin],
              ].map(([label, value, name, Icon]: any) => (
                <div
                  key={label}
                  className={`rounded-xl border p-4
                  ${theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-gray-50 border-gray-200"}`}
                >
                  <label className="text-xs text-gray-500">{label}</label>

                  {editing && name ? (
                    <input
                      name={name}
                      value={value || ""}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-lg px-3 py-2 border outline-none
                      ${theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300"}`}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Icon size={16} />
                      <span>{value || "-"}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex gap-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-emerald-600 cursor-pointer "
              >
                <Edit size={16} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PASSWORD CARD */}
      <div
        className={`rounded-2xl border p-6 space-y-4
        ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <h2 className="font-semibold flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>

        {passwordEditing ? (
          <>
            {["Current password", "New password", "Confirm password"].map(
              (placeholder, idx) => (
                <input
                  key={idx}
                  type="password"
                  placeholder={placeholder}
                  className={`w-full rounded-lg px-3 py-2 border outline-none
                  ${theme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-300"}`}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      ...(idx === 0 && { current: e.target.value }),
                      ...(idx === 1 && { newPassword: e.target.value }),
                      ...(idx === 2 && { confirm: e.target.value }),
                    })
                  }
                />
              )
            )}

            <button
              onClick={handleChangePassword}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Save Password
            </button>
          </>
        ) : (
          <button
            onClick={() => setPasswordEditing(true)}
            className="flex items-center gap-2 text-emerald-600 cursor-pointer "
          >
            <Edit size={16} /> Update Password
          </button>
        )}
      </div>
    </div>
  </DashboardLayout>
);

}
