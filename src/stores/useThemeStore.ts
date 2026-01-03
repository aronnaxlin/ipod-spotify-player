import { create } from 'zustand';

export const useThemeStore = create(() => ({
  current: 'classic',
}));
