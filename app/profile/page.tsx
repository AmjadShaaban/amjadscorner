"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

const ProfilePage = () => {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.put("/api/profile", { password });
    alert("Password updated");
  };

  if (!session) return <p>Please log in</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
