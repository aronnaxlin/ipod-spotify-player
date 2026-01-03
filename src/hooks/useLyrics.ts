export const useLyrics = (props: any) => ({
  isLoading: false,
  isTranslating: false,
  translationProgress: 0,
  originalLines: [],
  lines: [], // Added
  currentLine: 0, // Added
  error: null,
  furiganaInfo: null,
  soramimiInfo: null,
  updateCurrentTimeManually: (time: number) => {}, // Added
});