"use client";
import { useStore } from "../../lib/state";

export default function Forums() {
  const { user } = useStore();
  return <div>Forums - {user ? `Welcome, ${user}` : "Please log in"}</div>;
}
