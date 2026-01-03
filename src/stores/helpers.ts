import { useShallow } from 'zustand/react/shallow';
import { useIpodStore } from './useIpodStore';

export const useAppStoreShallow = (selector: any) => {
  return {
    bringToForeground: (id: string) => {},
    clearIpodInitialData: (id: string) => {},
    instances: {},
    restoreInstance: (id: string) => {},
  };
};

export const useIpodStoreShallow = (selector: (state: any) => any) => {
  return useIpodStore(useShallow(selector));
};

export const useAudioSettingsStoreShallow = (selector: any) => {
    return { ipodVolume: 0.8 };
};