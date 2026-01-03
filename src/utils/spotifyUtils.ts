import { Track } from '../stores/useIpodStore';

// Define a simplified Album interface for the app
export interface IpodAlbum {
  id: string;
  name: string;
  artist: string;
  cover: string;
  uri: string;
  tracks: Track[];
}

export interface IpodPlaylist {
  id: string;
  name: string;
  owner: string;
  cover: string;
  uri: string;
  tracks: Track[];
}

export interface IpodArtist {
  id: string;
  name: string;
  cover: string;
  uri: string;
}

export const convertSpotifyTrackToIpodTrack = (
  spotifyTrack: SpotifyApi.TrackObjectFull
): Track => {
  return {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists.map((a) => a.name).join(', '),
    album: spotifyTrack.album.name,
    url: spotifyTrack.uri, // Use URI for Spotify playback
    cover: spotifyTrack.album.images[0]?.url || '',
    duration: spotifyTrack.duration_ms,
  };
};

// For playlists/albums where we might get a simplified track object or a playlist track object
export const convertSpotifyPlaylistTrackToIpodTrack = (
  playlistTrack: SpotifyApi.PlaylistTrackObject
): Track | null => {
  if (!playlistTrack.track || playlistTrack.track.type !== 'track') return null;
  return convertSpotifyTrackToIpodTrack(playlistTrack.track as SpotifyApi.TrackObjectFull);
};

export const convertSpotifyAlbumToIpodAlbum = (
  spotifyAlbum: SpotifyApi.AlbumObjectFull | SpotifyApi.SavedAlbumObject
): IpodAlbum => {
  // Handle both direct AlbumObjectFull and SavedAlbumObject (which wraps AlbumObjectFull in .album)
  const album = 'album' in spotifyAlbum ? spotifyAlbum.album : spotifyAlbum;

  return {
    id: album.id,
    name: album.name,
    artist: album.artists.map((a) => a.name).join(', '),
    cover: album.images[0]?.url || '',
    uri: album.uri,
    tracks: album.tracks?.items.map((t) =>
      // Simplified tracks in albums don't have album info, so we map them manually
      ({
        id: t.id,
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: album.name,
        url: t.uri,
        cover: album.images[0]?.url || '',
        duration: t.duration_ms,
      })
    ) || [],
  };
};

export const convertSpotifySavedAlbumToSimplified = (
  item: SpotifyApi.SavedAlbumObject
): IpodAlbum => {
  return {
    id: item.album.id,
    name: item.album.name,
    artist: item.album.artists.map((a) => a.name).join(', '),
    cover: item.album.images[0]?.url || '',
    uri: item.album.uri,
    tracks: [], // Saved albums list usually doesn't need all tracks immediately
  };
};

export const convertSpotifyPlaylistToIpodPlaylist = (
  item: SpotifyApi.PlaylistObjectSimplified
): IpodPlaylist => {
  return {
    id: item.id,
    name: item.name,
    owner: item.owner.display_name || 'Unknown',
    cover: item.images[0]?.url || '',
    uri: item.uri,
    tracks: [],
  };
};

export const convertSpotifyArtistToIpodArtist = (
  item: SpotifyApi.ArtistObjectFull
): IpodArtist => {
  return {
    id: item.id,
    name: item.name,
    cover: item.images[0]?.url || '',
    uri: item.uri,
  };
};
