"use client";
import { useStore } from "../../lib/state";

export default function Shop() {
  const { cartItems, addToCart } = useStore();
  return (
    <div>
      <p>Shop - Items in Cart: {cartItems}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}
