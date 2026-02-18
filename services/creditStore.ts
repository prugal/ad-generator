import { create } from 'zustand';

interface CreditState {
  balance: number;
  setBalance: (balance: number) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
}));