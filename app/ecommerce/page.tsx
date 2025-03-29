"use client";
import { useStore } from "../../lib/state";

export default function Ecommerce() {
  const { cartItems, addToCart } = useStore();
  return (
    <div>
      <p>E-commerce - Items in Cart: {cartItems}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}
