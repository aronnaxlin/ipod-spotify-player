export enum LyricsAlignment {
  Center = 'center',
  FocusThree = 'focus-three',
  Alternating = 'alternating',
}

export enum LyricsFont {
  SansSerif = 'sans',
  Serif = 'serif',
  Rounded = 'rounded',
}

export enum KoreanDisplay {
  Hangul = 'hangul',
  Romanized = 'romanized',
}

export enum JapaneseFurigana {
  None = 'none',
  On = 'on',
}

export interface RomanizationSettings {
    enabled?: boolean;
    soramimi?: boolean;
    soramamiTargetLanguage?: "zh-TW" | "en";
    japaneseFurigana?: boolean;
    chinese?: boolean;
    korean?: boolean;
    japaneseRomaji?: boolean;
    pronunciationOnly?: boolean;
}

export interface LyricWord {
    text: string;
    startTime?: any;
    startTimeMs?: any; 
    endTime?: number;
    durationMs?: any;
}

export interface LyricLine {
    text: string;
    startTimeMs: any;
    words?: LyricWord[];
    wordTimings?: LyricWord[]; 
}

export const getLyricsFontClassName = (font: LyricsFont) => '';
