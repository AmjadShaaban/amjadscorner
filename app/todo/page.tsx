"use client"; // If client-side (e.g., for Zustand or interactivity)
import { useStore } from "../../lib/state";

export default function Todo() {
  const { cartItems } = useStore(); // Example shared state
  return <div>Todo App - Cart: {cartItems}</div>;
}
