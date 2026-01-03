export interface ActivityInfo {
  isLoading: boolean;
  message?: string;
  isLoadingLyrics?: boolean;
  isTranslating?: boolean;
  isFetchingFurigana?: boolean;
  isFetchingSoramimi?: boolean;
  isAddingSong?: boolean;
}

export const useActivityState = (props: any): ActivityInfo => ({
  isLoading: false,
  isLoadingLyrics: false,
  isTranslating: false,
  isFetchingFurigana: false,
  isFetchingSoramimi: false,
  isAddingSong: false,
});