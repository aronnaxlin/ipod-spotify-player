export const useFurigana = (props: any) => ({
  furiganaMap: new Map<any, any>(),
  soramimiMap: new Map<any, any>(),
  isFetchingFurigana: false,
  isFetchingSoramimi: false,
  furiganaProgress: 0,
  soramimiProgress: 0,
});