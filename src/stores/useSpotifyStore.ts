import { AUTH_ENDPOINT, SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '@/config/spotify';
import { toast } from 'sonner';
import SpotifyWebApi from 'spotify-web-api-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// PKCE Helper functions
async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

import {
    IpodAlbum,
    IpodArtist,
    IpodPlaylist,
    convertSpotifyAlbumToIpodAlbum,
    convertSpotifyArtistToIpodArtist,
    convertSpotifyPlaylistToIpodPlaylist,
    convertSpotifyPlaylistTrackToIpodTrack,
    convertSpotifySavedAlbumToSimplified,
    convertSpotifyTrackToIpodTrack
} from '@/utils/spotifyUtils';
import { Track, useIpodStore } from './useIpodStore';

// Playback state interface for real-time sync
export interface PlaybackState {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  trackId: string | null;
  trackName: string | null;
  artistName: string | null;
  albumName: string | null;
  albumCover: string | null;
  shuffleState: boolean;
  repeatState: 'off' | 'track' | 'context';
  volume: number;
  timestamp: number;
}

// Pagination cache for lazy loading
interface PaginationCache<T> {
  items: T[];
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
}

interface SpotifyState {
  accessToken: string | null;
  refreshToken: string | null;
  expirationTime: number | null;
  user: SpotifyApi.CurrentUsersProfileResponse | null;
  isActive: boolean;
  isPremium: boolean;
  api: SpotifyWebApi.SpotifyWebApiJs;
  codeVerifier: string | null;

  // Real-time playback state
  playbackState: PlaybackState | null;

  // Pagination caches for lazy loading
  albumsCache: PaginationCache<IpodAlbum>;
  playlistsCache: PaginationCache<IpodPlaylist>;
  artistsCache: PaginationCache<IpodArtist>;
  likedSongsCache: PaginationCache<Track>;

  // Auth & Init
  setAccessToken: (token: string, expiresIn: number, refreshToken?: string) => void;
  setUser: (user: SpotifyApi.CurrentUsersProfileResponse) => void;
  disconnect: () => void;
  init: () => Promise<void>;
  login: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  handlePastedUrl: (url: string) => Promise<boolean>;

  // Data Fetching with pagination (lazy loading)
  fetchSavedAlbums: (loadMore?: boolean) => Promise<IpodAlbum[]>;
  fetchPlaylists: (loadMore?: boolean) => Promise<IpodPlaylist[]>;
  fetchSmartPlaylists: () => Promise<IpodPlaylist[]>;
  fetchFollowedArtists: (loadMore?: boolean) => Promise<IpodArtist[]>;
  fetchLikedSongs: (loadMore?: boolean) => Promise<Track[]>;

  // Fetch tracks for details view
  fetchAlbumTracks: (id: string) => Promise<Track[]>;
  fetchPlaylistTracks: (id: string, loadMore?: boolean) => Promise<Track[]>;
  fetchArtistAlbums: (id: string) => Promise<IpodAlbum[]>;

  // Playback controls
  playUri: (uri: string) => Promise<void>;
  playTrack: (uri: string, contextUri?: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;

  // Real-time playback sync
  syncNowPlaying: () => Promise<void>;
  fetchPlaybackState: () => Promise<PlaybackState | null>;
  seekToPosition: (positionMs: number) => Promise<void>;
  setVolume: (percent: number) => Promise<void>;

  // Special playlists
  playDaylist: () => Promise<void>;
  playLikedSongs: (shuffle?: boolean) => Promise<void>;
}

const INITIAL_PAGE_SIZE = 50; // Load 50 items initially (about 2 pages worth)
const LOAD_MORE_SIZE = 50;   // Load 50 more items on scroll

const emptyPaginationCache = <T>(): PaginationCache<T> => ({
  items: [],
  total: 0,
  nextOffset: 0,
  hasMore: true,
});

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expirationTime: null,
      user: null,
      isActive: false,
      isPremium: true, // Assume premium by default
      api: new SpotifyWebApi(),
      codeVerifier: null,
      playbackState: null,

      // Initialize empty caches
      albumsCache: emptyPaginationCache<IpodAlbum>(),
      playlistsCache: emptyPaginationCache<IpodPlaylist>(),
      artistsCache: emptyPaginationCache<IpodArtist>(),
      likedSongsCache: emptyPaginationCache<Track>(),

      init: async () => {
        const { accessToken, api, expirationTime, syncNowPlaying } = get();
        if (accessToken) {
          if (expirationTime && Date.now() > expirationTime) {
             get().disconnect();
             return;
          }
          api.setAccessToken(accessToken);
          set({ isActive: true });

          // Fetch user to confirm connection and check premium status
          try {
            const user = await api.getMe();
            set({
              user,
              isPremium: user.product === 'premium'
            });

            // Sync current playback state
            await syncNowPlaying();
          } catch (e) {
            console.error('Failed to fetch user on init:', e);
          }
        }
      },

      login: async () => {
        // Generate PKCE code verifier and challenge
        const codeVerifier = await generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Save code verifier for later token exchange
        set({ codeVerifier });

        const args = new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          response_type: 'code',
          redirect_uri: SPOTIFY_REDIRECT_URI,
          scope: SPOTIFY_SCOPES.join(' '),
          code_challenge_method: 'S256',
          code_challenge: codeChallenge,
          show_dialog: 'true'
        });

        const authUrl = `${AUTH_ENDPOINT}?${args}`;

        // Check if running in Electron with the API available
        if (window.electronAPI?.openExternal) {
          window.electronAPI.openExternal(authUrl);
          toast.info('Opening Spotify login... The app should handle the redirect automatically. If not, copy the URL and paste it back.', {
            duration: 15000,
          });
        } else {
          // Fallback: web mode - redirect
          window.location.href = authUrl;
        }
      },

      // Handle the authorization code callback
      handleCallback: async (code: string) => {
        const { codeVerifier, api } = get();

        if (!codeVerifier) {
          toast.error('Session expired. Please try logging in again.');
          return false;
        }

        try {
          // Exchange authorization code for access token
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: SPOTIFY_CLIENT_ID,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: SPOTIFY_REDIRECT_URI,
              code_verifier: codeVerifier,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Token exchange failed:', error);
            toast.error('Failed to connect to Spotify');
            return false;
          }

          const data = await response.json();

          // Set token and immediately mark as active
          api.setAccessToken(data.access_token);
          set({
            accessToken: data.access_token,
            expirationTime: Date.now() + data.expires_in * 1000,
            refreshToken: data.refresh_token || get().refreshToken,
            isActive: true,
            codeVerifier: null,
          });

          // Fetch user profile to confirm connection
          try {
            const user = await api.getMe();
            set({
              user,
              isPremium: user.product === 'premium'
            });
          } catch (e) {
            console.error('Failed to fetch user after auth:', e);
          }

          // Sync current playback
          await get().syncNowPlaying();

          toast.success('Connected to Spotify!');
          return true;
        } catch (error) {
          console.error('Token exchange error:', error);
          toast.error('Failed to connect to Spotify');
          return false;
        }
      },

      // Handle manually pasted redirect URL
      handlePastedUrl: async (url: string) => {
        try {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');

          if (error) {
            toast.error(`Spotify auth error: ${error}`);
            return false;
          }

          if (!code) {
            toast.error('No authorization code found in URL');
            return false;
          }

          return await get().handleCallback(code);
        } catch (e) {
          toast.error('Invalid URL format');
          return false;
        }
      },

      // Fetch saved albums with lazy loading
      fetchSavedAlbums: async (loadMore = false) => {
        const { api, accessToken, albumsCache } = get();
        if (!accessToken) return [];

        // Always fetch fresh on initial load

        const offset = loadMore ? (albumsCache.nextOffset ?? 0) : 0;
        const limit = loadMore ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE;

        try {
          const response = await api.getMySavedAlbums({ limit, offset });
          const newItems = response.items.map(convertSpotifySavedAlbumToSimplified);

          const updatedItems = loadMore
            ? [...albumsCache.items, ...newItems]
            : newItems;

          const hasMore = response.next !== null;

          set({
            albumsCache: {
              items: updatedItems,
              total: response.total,
              nextOffset: hasMore ? offset + limit : null,
              hasMore,
            }
          });

          return updatedItems;
        } catch (error) {
          console.error('Failed to fetch albums:', error);
          toast.error('Failed to load albums');
          return albumsCache.items;
        }
      },

      // Fetch playlists with lazy loading
      // Smart playlists (Daily Mix, Daylist, etc) appear in me/playlists if user has saved/followed them
      fetchPlaylists: async (loadMore = false) => {
        const { accessToken, playlistsCache } = get();
        if (!accessToken) return [];

        // When not loading more, always fetch fresh data from API
        // This ensures we get the latest playlists on each session
        const offset = loadMore ? (playlistsCache.nextOffset ?? 0) : 0;
        const limit = loadMore ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE;

        try {
          console.log('[Playlists] Fetching from API, offset:', offset, 'limit:', limit);

          // Use direct fetch like ipod-classic-js instead of spotify-web-api-js
          // (the library's getUserPlaylists has wrong parameter order issues)
          const response = await fetch(
            `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[Playlists] API error:', response.status, errorText);
            throw new Error(`Failed to fetch playlists: ${response.status}`);
          }

          const data = await response.json() as SpotifyApi.ListOfCurrentUsersPlaylistsResponse;

          // Detailed debug logging
          console.log('[Playlists] Raw response:', {
            total: data.total,
            limit: data.limit,
            offset: data.offset,
            itemsCount: data.items?.length,
            next: data.next,
            previous: data.previous,
          });

          const newItems = data.items.map(convertSpotifyPlaylistToIpodPlaylist);
          console.log('[Playlists] Received', newItems.length, 'playlists:', newItems.map(p => p.name));

          const updatedItems = loadMore
            ? [...playlistsCache.items, ...newItems]
            : newItems;

          const hasMore = data.next !== null;

          set({
            playlistsCache: {
              items: updatedItems,
              total: data.total,
              nextOffset: hasMore ? offset + limit : null,
              hasMore,
            }
          });

          return updatedItems;
        } catch (error) {
          console.error('Failed to fetch playlists:', error);
          toast.error('Failed to load playlists');
          return playlistsCache.items;
        }
      },

      // Fetch "Made For You" style playlists
      // NOTE: These are included in me/playlists if user has saved/followed them
      // Search-based approach doesn't work reliably, so just return empty array
      fetchSmartPlaylists: async () => {
          return [];
      },

      // Fetch followed artists with cursor-based lazy loading
      fetchFollowedArtists: async (loadMore = false) => {
        const { api, accessToken, artistsCache } = get();
        if (!accessToken) return [];

        // Always fetch fresh on initial load

        const limit = loadMore ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE;
        // For cursor pagination, use the last artist's ID as 'after'
        let after = loadMore && artistsCache.items.length > 0
          ? artistsCache.items[artistsCache.items.length - 1].id
          : undefined;

        // Safety check for weird cursor states
        if (after === '0') after = undefined;

        try {
          const response = await api.getFollowedArtists({ limit, after, type: 'artist' });
          let newItems = response.artists.items.map(convertSpotifyArtistToIpodArtist);

          // If Initial Load, also fetch artists from Saved Albums and merge
          if (!loadMore) {
            try {
              const savedAlbums = await api.getMySavedAlbums({ limit: 50 });
              const albumArtistIds = new Set<string>();

              savedAlbums.items.forEach((item) => {
                item.album.artists.forEach((a) => albumArtistIds.add(a.id));
              });

              // Filter out IDs we already have from "Followed"
              const existingIds = new Set(newItems.map((i) => i.id));
              const missingIds = Array.from(albumArtistIds).filter((id) => !existingIds.has(id));

              // Fetch full artist details for these missing IDs (max 50)
              if (missingIds.length > 0) {
                // Spotify allows max 50 IDs per request
                const chunks = [];
                for (let i = 0; i < missingIds.length; i += 50) {
                  chunks.push(missingIds.slice(i, i + 50));
                }

                for (const chunk of chunks) {
                  const artistsRes = await api.getArtists(chunk);
                  const albumArtists = artistsRes.artists.map(convertSpotifyArtistToIpodArtist);
                  newItems = [...newItems, ...albumArtists];
                }
              }

              // Sort merged list alphabetically
              newItems.sort((a, b) => a.name.localeCompare(b.name));
            } catch (e) {
              console.error('Failed to merge album artists', e);
            }
          }

          const updatedItems = loadMore
            ? [...artistsCache.items, ...newItems]
            : newItems;

          const hasMore = response.artists.next !== null;

          set({
            artistsCache: {
              items: updatedItems,
              total: response.artists.total,
              nextOffset: null, // Cursor pagination doesn't use offset
              hasMore,
            }
          });

          return updatedItems;
        } catch (error) {
          console.error('Failed to fetch artists:', error);
          toast.error('Failed to load artists. Try reconnecting Spotify.');
          return artistsCache.items;
        }
      },

      // Fetch Liked Songs (Saved Tracks) with lazy loading
      fetchLikedSongs: async (loadMore = false) => {
        const { api, accessToken, likedSongsCache } = get();
        if (!accessToken) return [];

        if (!loadMore && likedSongsCache.items.length > 0) {
          return likedSongsCache.items;
        }

        const offset = loadMore ? (likedSongsCache.nextOffset ?? 0) : 0;
        const limit = loadMore ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE;

        try {
          const response = await api.getMySavedTracks({ limit, offset });
          const newItems = response.items
            .filter(item => item.track)
            .map(item => convertSpotifyTrackToIpodTrack(item.track as SpotifyApi.TrackObjectFull));

          const updatedItems = loadMore
            ? [...likedSongsCache.items, ...newItems]
            : newItems;

          const hasMore = response.next !== null;

          set({
            likedSongsCache: {
              items: updatedItems,
              total: response.total,
              nextOffset: hasMore ? offset + limit : null,
              hasMore,
            }
          });

          return updatedItems;
        } catch (error) {
          console.error('Failed to fetch liked songs:', error);
          toast.error('Failed to load songs');
          return likedSongsCache.items;
        }
      },

      fetchAlbumTracks: async (id: string) => {
        const { api, accessToken } = get();
        if (!accessToken) return [];

        try {
          const response = await api.getAlbum(id);
          return convertSpotifyAlbumToIpodAlbum(response).tracks;
        } catch (error) {
          console.error('Failed to fetch album tracks:', error);
          return [];
        }
      },

      fetchPlaylistTracks: async (id: string, loadMore = false) => {
        const { api, accessToken } = get();
        if (!accessToken) return [];

        try {
          // For simplicity, fetch all tracks (up to 100 initially)
          const response = await api.getPlaylistTracks(id, { limit: 100 });
          return response.items
            .map(convertSpotifyPlaylistTrackToIpodTrack)
            .filter((t): t is Track => t !== null);
        } catch (error) {
          console.error('Failed to fetch playlist tracks:', error);
          return [];
        }
      },

      fetchArtistAlbums: async (id: string) => {
        const { api, accessToken } = get();
        if (!accessToken) return [];

        try {
          const response = await api.getArtistAlbums(id, { include_groups: ['album', 'single'], limit: 50 });
          const uniqueNames = new Set();
          const uniqueAlbums: SpotifyApi.AlbumObjectSimplified[] = [];

          response.items.forEach(album => {
            if (!uniqueNames.has(album.name)) {
              uniqueNames.add(album.name);
              uniqueAlbums.push(album);
            }
          });

          return uniqueAlbums.map(album => ({
            id: album.id,
            name: album.name,
            artist: album.artists.map(a => a.name).join(', '),
            cover: album.images[0]?.url || '',
            uri: album.uri,
            tracks: []
          }));
        } catch (error) {
          console.error('Failed to fetch artist albums:', error);
          return [];
        }
      },

      // Play Liked Songs (shuffle optional)
      playLikedSongs: async (shuffle = true) => {
        const { api, accessToken, fetchLikedSongs } = get();
        if (!accessToken) return;

        try {
          toast.info("Loading Liked Songs...");

          // Fetch first batch of liked songs
          const songs = await fetchLikedSongs(false);
          if (songs.length === 0) {
            toast.error("No liked songs found");
            return;
          }

          const devices = await api.getMyDevices();
          if (devices.devices.length === 0) {
            toast.error('No Spotify devices found. Open Spotify on your device.');
            return;
          }

          let activeDevice = devices.devices.find(d => d.is_active);
          if (!activeDevice) {
            activeDevice = devices.devices[0];
            if (activeDevice.id) {
              await api.transferMyPlayback([activeDevice.id]);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          // Set shuffle state
          try {
            await api.setShuffle(shuffle);
          } catch (e) {
            console.error('Failed to set shuffle:', e);
          }

          // Play the first batch of song URIs
          const uris = songs.slice(0, 50).map(s => s.url);
          await api.play({
            device_id: activeDevice?.id,
            uris,
          } as any);

          // Reduced from 1s to 200ms for faster sync
          setTimeout(() => get().syncNowPlaying(), 200);
        } catch (e) {
          console.error("Play Liked Songs error:", e);
          toast.error("Could not play Liked Songs");
        }
      },

      playDaylist: async () => {
          const { api, accessToken, playUri, fetchPlaylists } = get();
          if (!accessToken) return;

          try {
              toast.info("Looking for Daylist...");

              // Fetch playlists (will use cache if available)
              const playlists = await fetchPlaylists(false);

              // Look for daylist first
              const daylist = playlists.find(p => p.name.toLowerCase().includes('daylist'));
              if (daylist) {
                  await playUri(daylist.uri);
                  return;
              }

              // Search for daylist if not in library
              const searchRes = await api.searchPlaylists('daylist', { limit: 1 });
              if (searchRes.playlists.items.length > 0) {
                   await playUri(searchRes.playlists.items[0].uri);
                   return;
              }

              // Fallback to Daily Mix
              const dailyMix = playlists.find(p => p.name.toLowerCase().includes('daily mix'));
              if (dailyMix) {
                  await playUri(dailyMix.uri);
                  return;
              }

              // Final fallback: play Liked Songs
              toast.info("Daylist not found, playing Liked Songs");
              await get().playLikedSongs(true);
          } catch (e) {
              console.error("Shuffle/Daylist error:", e);
              toast.error("Could not play Daylist");
          }
      },

      // Set volume (premium only, silently fails for non-premium)
      setVolume: async (percent: number) => {
          const { api, accessToken, isPremium } = get();
          if (!accessToken || !isPremium) return;

          try {
              const volume = Math.max(0, Math.min(100, Math.round(percent)));
              await api.setVolume(volume);
          } catch (e: any) {
              // Check if it's a premium-required error
              if (e?.status === 403 || e?.message?.includes('PREMIUM_REQUIRED')) {
                set({ isPremium: false });
              }
              console.error("Volume error:", e);
          }
      },

      // Seek to position (in milliseconds)
      seekToPosition: async (positionMs: number) => {
        const { api, accessToken, playbackState } = get();
        if (!accessToken) return;

        try {
          const safePosition = Math.max(0, Math.round(positionMs));
          await api.seek(safePosition);

          // Update local state immediately for responsive UI
          if (playbackState) {
            set({
              playbackState: {
                ...playbackState,
                positionMs: safePosition,
                timestamp: Date.now(),
              }
            });
          }
        } catch (e) {
          console.error("Seek error:", e);
        }
      },

      // Fetch current playback state
      fetchPlaybackState: async () => {
        const { api, accessToken } = get();
        if (!accessToken) return null;

        try {
          const state = await api.getMyCurrentPlaybackState();

          if (!state || !state.item || state.item.type !== 'track') {
            set({ playbackState: null });
            return null;
          }

          const track = state.item as SpotifyApi.TrackObjectFull;
          const playbackState: PlaybackState = {
            isPlaying: state.is_playing,
            positionMs: state.progress_ms ?? 0,
            durationMs: track.duration_ms,
            trackId: track.id,
            trackName: track.name,
            artistName: track.artists.map(a => a.name).join(', '),
            albumName: track.album.name,
            albumCover: track.album.images[0]?.url ?? null,
            shuffleState: state.shuffle_state ?? false,
            repeatState: state.repeat_state as 'off' | 'track' | 'context' ?? 'off',
            volume: state.device?.volume_percent ?? 100,
            timestamp: Date.now(),
          };

          set({ playbackState });
          return playbackState;
        } catch (e) {
          console.error('Fetch playback state error:', e);
          return null;
        }
      },

      playUri: async (uri: string) => {
        try {
            await get().playTrack(uri);
        } catch (e) {
            // Already handled
        }
      },

      playTrack: async (uri: string, contextUri?: string) => {
        const { api, accessToken } = get();
        if (!accessToken) {
            toast.error('Not connected to Spotify');
            return;
        }

        try {
            const devicesResponse = await api.getMyDevices();
            const devices = devicesResponse.devices;

            if (devices.length === 0) {
            toast.error('No Spotify devices found. Open Spotify on your device.');
            return;
            }

            let activeDevice = devices.find(d => d.is_active);

            if (!activeDevice) {
                activeDevice = devices[0];
                if (activeDevice.id) {
                await api.transferMyPlayback([activeDevice.id]);
                await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            const playOptions: any = { device_id: activeDevice?.id };
            if (contextUri) {
                playOptions.context_uri = contextUri;
                playOptions.offset = { uri: uri };
            } else if (uri.startsWith('spotify:track:')) {
                playOptions.uris = [uri];
            } else {
                playOptions.context_uri = uri;
            }

            await api.play(playOptions);
            // Immediately sync after API confirms - reduced from 1s to 200ms
            // The Web Playback SDK will also fire player_state_changed for even faster sync
            setTimeout(() => get().syncNowPlaying(), 200);
        } catch (error) {
            console.error('Failed to play:', error);
            toast.error('Playback failed. Is Spotify active?');
        }
      },

      syncNowPlaying: async () => {
        const { api, accessToken, fetchPlaybackState } = get();
        if (!accessToken) return;

        try {
            const playbackState = await fetchPlaybackState();

            if (playbackState && playbackState.trackId) {
                const ipodStore = useIpodStore.getState();

                // Create track object from playback state
                const ipodTrack: Track = {
                  id: playbackState.trackId,
                  title: playbackState.trackName || 'Unknown',
                  artist: playbackState.artistName || 'Unknown Artist',
                  album: playbackState.albumName || 'Unknown Album',
                  url: `spotify:track:${playbackState.trackId}`,
                  cover: playbackState.albumCover || '',
                  duration: playbackState.durationMs,
                };

                const existingIndex = ipodStore.tracks.findIndex(t => t.id === ipodTrack.id);

                if (existingIndex === -1) {
                    // Add new track
                    ipodStore.setTracks([...ipodStore.tracks, ipodTrack]);
                } else {
                    // Update existing track metadata (this was missing before!)
                    const updatedTracks = [...ipodStore.tracks];
                    updatedTracks[existingIndex] = { ...updatedTracks[existingIndex], ...ipodTrack };
                    ipodStore.setTracks(updatedTracks);
                }

                if (ipodStore.currentSongId !== ipodTrack.id) {
                    ipodStore.setCurrentSongId(ipodTrack.id);
                }

                if (ipodStore.isPlaying !== playbackState.isPlaying) {
                     ipodStore.setIsPlaying(playbackState.isPlaying);
                }
            }
        } catch (e) {
            console.error('Sync error:', e);
        }
      },

      pause: async () => {
        const { api, accessToken, playbackState } = get();
        if (!accessToken) return;
        try {
            await api.pause();
            useIpodStore.getState().setIsPlaying(false);
            if (playbackState) {
              set({
                playbackState: { ...playbackState, isPlaying: false }
              });
            }
        } catch (e) {
            console.error('Pause error:', e);
        }
      },

      resume: async () => {
        const { api, accessToken, playbackState } = get();
        if (!accessToken) return;
        try {
            await api.play();
            useIpodStore.getState().setIsPlaying(true);
            if (playbackState) {
              set({
                playbackState: { ...playbackState, isPlaying: true }
              });
            }
        } catch (e) {
            console.error('Resume error:', e);
        }
      },

      next: async () => {
        const { api, accessToken } = get();
        if (!accessToken) return;
        try {
            await api.skipToNext();
            // Reduced from 500ms to 200ms for faster sync
            setTimeout(() => get().syncNowPlaying(), 200);
        } catch (e) {
            console.error('Next error:', e);
        }
      },

      previous: async () => {
        const { api, accessToken } = get();
        if (!accessToken) return;
        try {
            await api.skipToPrevious();
            // Reduced from 500ms to 200ms for faster sync
            setTimeout(() => get().syncNowPlaying(), 200);
        } catch (e) {
            console.error('Previous error:', e);
        }
      },

      setAccessToken: (token, expiresIn, refreshToken) => {
        const { api } = get();
        api.setAccessToken(token);
        set({
          accessToken: token,
          expirationTime: Date.now() + expiresIn * 1000,
          refreshToken: refreshToken || get().refreshToken,
          isActive: true
        });
      },

      setUser: (user) => set({ user }),

      disconnect: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expirationTime: null,
          user: null,
          isActive: false,
          isPremium: true,
          codeVerifier: null,
          playbackState: null,
          albumsCache: emptyPaginationCache<IpodAlbum>(),
          playlistsCache: emptyPaginationCache<IpodPlaylist>(),
          artistsCache: emptyPaginationCache<IpodArtist>(),
          likedSongsCache: emptyPaginationCache<Track>(),
        });
      },
    }),
    {
      name: 'spotify-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expirationTime: state.expirationTime,
        user: state.user,
        codeVerifier: state.codeVerifier,
        isPremium: state.isPremium,
      }),
    }
  )
);
