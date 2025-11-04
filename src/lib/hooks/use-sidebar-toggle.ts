/* eslint-disable @typescript-eslint/no-unsafe-call */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface useSidebarToggleStore {
  isOpen: boolean;
  setIsOpen: () => void;
}

export const useSidebarToggle = create(
  persist<useSidebarToggleStore>(
    (set, get) => ({
      isOpen: true,
      setIsOpen: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        set({ isOpen: !get().isOpen });
      }
    }),
    {
      name: 'sidebarOpen',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
