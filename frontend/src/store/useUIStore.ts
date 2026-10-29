import { create } from "zustand";

interface UIState {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  isChatOpen: false,
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
}));
