"use client";
import { useAuthStore } from "../../lib/state";

export default function Forums() {
  const { user } = useAuthStore();
  return (
    <div>Forums - {user ? `Welcome, ${user.email}` : "Please log in"}</div>
  );
}
