export const isChineseText = (text: string) => false;
export const hasKanaTextLocal = (text: string) => false;
export const hasKoreanText = (text: string) => false;
export const KOREAN_REGEX = /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/;
// Add optional second arg to ignore
export const renderKoreanWithRomanization = (text: string, _?: string) => text;
export const renderChineseWithPinyin = (text: string, _?: string) => text;
export const renderKanaWithRomaji = (text: string, _?: string) => text;
export const getFuriganaSegmentsPronunciationOnly = (segments: any[], _?: any) => "";
export const getKoreanPronunciationOnly = (text: string) => "";
export const getChinesePronunciationOnly = (text: string) => "";
export const getKanaPronunciationOnly = (text: string) => "";

export type FuriganaSegment = {
  text: string;
  reading?: string;
};
