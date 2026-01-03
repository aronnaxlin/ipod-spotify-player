export interface ActivityInfo {
  isLoading: boolean;
  message?: string;
  isLoadingLyrics?: boolean;
  isTranslating?: boolean;
  isFetchingFurigana?: boolean;
  isFetchingSoramimi?: boolean;
  isAddingSong?: boolean;
}

export const useActivityLabel = () => ({ isLoading: false });