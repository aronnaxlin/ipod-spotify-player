import { create } from 'zustand';

interface AudioSettingsState {
  masterVolume: number;
  ipodVolume: number;
  setIpodVolume: (volume: number) => void;
  increaseIpodVolume: () => void;
  decreaseIpodVolume: () => void;
}

// Volume step size (4% per scroll step, matching ipod-classic-js)
const VOLUME_STEP = 0.04;

export const useAudioSettingsStore = create<AudioSettingsState>((set, get) => ({
  masterVolume: 1.0,
  ipodVolume: 0.8,
  setIpodVolume: (volume: number) => set({ ipodVolume: Math.max(0.01, Math.min(1, volume)) }),
  increaseIpodVolume: () => {
    const current = get().ipodVolume;
    if (current >= 1) return;
    set({ ipodVolume: Math.min(1, current + VOLUME_STEP) });
  },
  decreaseIpodVolume: () => {
    const current = get().ipodVolume;
    if (current <= 0.01) return;
    set({ ipodVolume: Math.max(0.01, current - VOLUME_STEP) });
  },
}));
