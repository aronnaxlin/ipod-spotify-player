import { useIpodStore } from '@/stores/useIpodStore';
import { useSpotifyStore } from '@/stores/useSpotifyStore';
import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const useSpotifyPlayer = () => {
  const { accessToken } = useSpotifyStore();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  // Initialize SDK
  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'iPod Player',
        getOAuthToken: (cb: any) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        // Automatically transfer playback to this device?
        // Maybe better to let user select it or just have it available
      });

      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        const track = state.track_window.current_track;
        const prevTrackId = currentTrack?.id;

        setPaused(state.paused);
        setCurrentTrack(track);

        // Detect track change for faster sync
        const trackChanged = track && prevTrackId !== track.id;

        // Build full track object for IpodStore
        const ipodTrack = track ? {
          id: track.id,
          title: track.name,
          artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
          album: track.album?.name || 'Unknown Album',
          url: `spotify:track:${track.id}`,
          cover: track.album?.images?.[0]?.url || '',
          duration: track.duration_ms,
        } : null;

        // Update SpotifyStore playback state immediately
        if (track) {
          useSpotifyStore.setState({
            playbackState: {
              isPlaying: !state.paused,
              positionMs: state.position || 0,
              durationMs: track.duration_ms || 0,
              trackId: track.id,
              trackName: track.name,
              artistName: ipodTrack?.artist || '',
              albumName: ipodTrack?.album || '',
              albumCover: ipodTrack?.cover || null,
              shuffleState: state.shuffle || false,
              repeatState: state.repeat_mode === 1 ? 'track' : state.repeat_mode === 2 ? 'context' : 'off',
              volume: 100,
              timestamp: Date.now(),
            }
          });
        }

        // Sync with iPod Store UI - add track if missing
        const ipodState = useIpodStore.getState();
        if (ipodTrack) {
          const existingTrack = ipodState.tracks.find(t => t.id === ipodTrack.id);
          if (!existingTrack) {
            useIpodStore.setState({
              tracks: [...ipodState.tracks, ipodTrack],
            });
          }
        }

        useIpodStore.setState({
          isPlaying: !state.paused,
          currentSongId: track?.id || ipodState.currentSongId,
        });

        // Log track change for debugging
        if (trackChanged) {
          console.log('[SpotifyPlayer] Track changed via SDK:', track?.name);
        }
      });

      player.connect();
    };

    return () => {
        if (player) player.disconnect();
    };
  }, [accessToken]);

  const togglePlay = useCallback(() => {
      player?.togglePlay();
  }, [player]);

  const nextTrack = useCallback(() => {
      player?.nextTrack();
  }, [player]);

  const previousTrack = useCallback(() => {
      player?.previousTrack();
  }, [player]);

  return { player, deviceId, isPaused, currentTrack, togglePlay, nextTrack, previousTrack };
};
