import { create } from 'zustand';

interface AppState {
  user: string | null;
  cartItems: number;
  setUser: (user: string | null) => void;
  addToCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  cartItems: 0,
  setUser: (user) => set({ user }),
  addToCart: () => set((state) => ({ cartItems: state.cartItems + 1 })),
}));