// TODO: Replace with your actual Client ID from Spotify Developer Dashboard
// https://developer.spotify.com/dashboard
export const SPOTIFY_CLIENT_ID = 'f07765a97e914cd09ae0b7038dafea35';

// Redirect URI - must be added to Spotify Dashboard
export const SPOTIFY_REDIRECT_URI = 'ipodplayer://callback';

export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative'
];

export const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
