import { useState, useEffect } from "react";
import api from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(data);
        setForm({
          name: data.name,
          email: data.email
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const updateData = { ...form };
      if (passwordData.newPassword) {
        updateData.password = passwordData.newPassword;
      }

      const { data } = await api.put("/users/profile", updateData);
      
      setUser(data);
      // Update local storage currentUser (name and email)
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, ...data }));

      setSuccess("Profile updated successfully");
      setEditMode(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <h2>No user data found.</h2>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-96 space-y-4">

        <h2 className="text-2xl font-bold text-center dark:text-white">
          My Profile
        </h2>

        {editMode ? (
          <>
            {/* Name */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase ml-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 rounded border dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email (disabled in UI, though backend allows it, usually better to keep restricted or separate) */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase ml-1">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2 mt-1 rounded border bg-gray-200 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase ml-1">New Password (optional)</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 mt-1 rounded border dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase ml-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 mt-1 rounded border dark:bg-gray-700 dark:text-white"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {success && (
              <p className="text-green-500 text-sm">{success}</p>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditMode(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-lg font-semibold dark:text-white">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg font-semibold dark:text-white">
                {user.email}
              </p>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Edit Profile
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default Profile;