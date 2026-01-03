export interface AppProps<T> {
  isWindowOpen: boolean;
  onClose: () => void;
  isForeground?: boolean;
  skipInitialSound?: boolean;
  initialData?: T;
  instanceId?: string;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
}

export interface IpodInitialData {
  videoId?: string;
}

export interface BaseApp<T> {
  id: string;
  name: string;
  icon: any;
  description: string;
  component: any;
  helpItems: any[];
  metadata: any;
}
