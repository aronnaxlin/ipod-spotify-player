import { create } from 'zustand';

export const useDisplaySettingsStore = create(() => ({
  debugMode: false,
}));
