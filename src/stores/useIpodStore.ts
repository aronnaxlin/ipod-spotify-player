import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  url: string;
  cover?: string;
  duration?: number;
  lyricsSource?: any;
  lyricOffset?: number;
}

interface IpodState {
  tracks: Track[];
  currentSongId: string | null;
  isPlaying: boolean;
  isShuffled: boolean;
  loopCurrent: boolean; // Repeat One
  loopAll: boolean;     // Repeat All

  backlightOn: boolean;
  theme: 'classic' | 'black' | 'u2';
  lcdFilterOn: boolean;

  // Lyrics & Settings
  showLyrics: boolean;
  lyricsAlignment: any;
  lyricsFont: any;
  koreanDisplay: any;
  japaneseFurigana: any;
  romanization: any;
  lyricsTranslationLanguage: string | null;
  isFullScreen: boolean;
  currentLyrics?: any;

  // Actions
  setTracks: (tracks: Track[]) => void;
  setCurrentSongId: (id: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  toggleLoopCurrent: () => void;
  toggleLoopAll: () => void;
  toggleBacklight: () => void;
  setTheme: (theme: 'classic' | 'black' | 'u2') => void;
  setLyricsTranslationLanguage: (lang: string | null) => void;
  setLyricsAlignment: (alignment: any) => void;
  setLyricsFont: (font: any) => void;
  toggleFullScreen: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  clearLibrary: () => void;
  refreshLyrics: () => void;
  setTrackLyricsSource: (id: string, source: any) => void;
  clearTrackLyricsSource: (id: string) => void;
  setLyricOffset: (index: number, offset: number) => void;
  adjustLyricOffset: (index: number, delta: number) => void;
  setCurrentFuriganaMap: (map: any) => void;
  setRomanization: (settings: any) => void;
  getCurrentTrack: () => Track | undefined;
}

// Sample initial tracks
const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Sample Song',
    artist: 'Artist Name',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://via.placeholder.com/300',
  },
  {
      id: '2',
      title: 'Another Track',
      artist: 'Cool Band',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      cover: 'https://via.placeholder.com/300/0000FF/808080',
    }
];

export const useIpodStore = create<IpodState>()(
  persist(
    (set, get) => ({
      tracks: sampleTracks,
      currentSongId: sampleTracks[0].id,
      isPlaying: false,
      isShuffled: false,
      loopCurrent: false,
      loopAll: false,
      backlightOn: true,
      theme: 'classic',
      lcdFilterOn: true,
      showLyrics: true,
      lyricsAlignment: 'center',
      lyricsFont: 'sans',
      koreanDisplay: 'hangul',
      japaneseFurigana: 'none',
      romanization: {},
      lyricsTranslationLanguage: null,
      isFullScreen: false,

      setTracks: (tracks) => set({ tracks }),
      setCurrentSongId: (id) => set({ currentSongId: id }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
      toggleLoopCurrent: () => set((state) => ({ loopCurrent: !state.loopCurrent })),
      toggleLoopAll: () => set((state) => ({ loopAll: !state.loopAll })),
      toggleBacklight: () => set((state) => ({ backlightOn: !state.backlightOn })),
      setTheme: (theme) => set({ theme }),
      setLyricsTranslationLanguage: (lang) => set({ lyricsTranslationLanguage: lang }),
      setLyricsAlignment: (alignment) => set({ lyricsAlignment: alignment }),
      setLyricsFont: (font) => set({ lyricsFont: font }),
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

      nextTrack: () => {
        const { tracks, currentSongId, isShuffled } = get();
        if (tracks.length === 0) return;

        let nextIndex = 0;
        const currentIndex = tracks.findIndex(t => t.id === currentSongId);

        if (isShuffled) {
          nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
          nextIndex = (currentIndex + 1) % tracks.length;
        }

        set({ currentSongId: tracks[nextIndex].id });
      },

      previousTrack: () => {
        const { tracks, currentSongId } = get();
        if (tracks.length === 0) return;

        const currentIndex = tracks.findIndex(t => t.id === currentSongId);
        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        set({ currentSongId: tracks[prevIndex].id });
      },

      clearLibrary: () => set({ tracks: [], currentSongId: null }),
      refreshLyrics: () => {},
      setTrackLyricsSource: () => {},
      clearTrackLyricsSource: () => {},
      setLyricOffset: () => {},
      adjustLyricOffset: () => {},
      setCurrentFuriganaMap: () => {},
      setRomanization: () => {},
      getCurrentTrack: () => {
        const { tracks, currentSongId } = get();
        return tracks.find(t => t.id === currentSongId);
      },
    }),
    {
      name: 'ipod-storage',
    }
  )
);

// Helpers
export const getEffectiveTranslationLanguage = (lang: string | null) => lang;
export const flushPendingLyricOffsetSave = async (id: string) => {};
