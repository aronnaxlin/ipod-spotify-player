import React from "react";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

interface IpodMenuBarProps {
  onClose: () => void;
  onShowHelp: () => void;
  onShowAbout: () => void;
  onClearLibrary: () => void;
  onSyncLibrary: () => void;
  onAddSong: () => void;
  onShareSong: () => void;
  onRefreshLyrics: () => void;
  onAdjustTiming: () => void;
  onToggleCoverFlow: () => void;
}

export function IpodMenuBar(props: IpodMenuBarProps) {
  return null;
}
