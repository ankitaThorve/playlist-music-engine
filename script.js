/**
 * Flattens an array of playlists into a single array of track objects,
 * adding a 'source' property with [playlistIndex, trackIndex].
 */
function flattenPlaylists(playlists) {
  if (!Array.isArray(playlists)) {
    return [];
  }

  const flattened = [];
  playlists.forEach((playlist, playlistIndex) => {
    playlist.forEach((track, trackIndex) => {
      flattened.push({
        ...track,
        source: [playlistIndex, trackIndex]
      });
    });
  });
  return flattened;
}

/**
 * Scores tracks based on votes and BPM.
 * Formula: votes * 10 - Math.abs(bpm - 120)
 */
function scoreTracks(tracks) {
  return tracks.map(track => ({
    ...track,
    score: (track.votes * 10) - Math.abs(track.bpm - 120)
  }));
}

/**
 * Removes duplicate tracks based on trackId, keeping the first occurrence.
 */
function dedupeTracks(tracks) {
  const seen = new Set();
  return tracks.filter(track => {
    if (seen.has(track.trackId)) {
      return false;
    }
    seen.add(track.trackId);
    return true;
  });
}

/**
 * Enforces a maximum number of tracks per artist, keeping the earliest occurrences.
 */
function enforceArtistQuota(tracks, maxPerArtist) {
  const artistCounts = {};
  return tracks.filter(track => {
    artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
    return artistCounts[track.artist] <= maxPerArtist;
  });
}

/**
 * Builds the final schedule with 1-based slots.
 */
function buildSchedule(tracks) {
  return tracks.map((track, index) => ({
    slot: index + 1,
    trackId: track.trackId
  }));
}

/**
 * Main function to process playlists into a final schedule.
 */
function remixPlaylist(playlists, maxPerArtist) {
  const flat = flattenPlaylists(playlists);
  const scored = scoreTracks(flat);
  const deduped = dedupeTracks(scored);
  const enforced = enforceArtistQuota(deduped, maxPerArtist);
  const schedule = buildSchedule(enforced);
  return schedule;
}

// --- Example Usage ---
const playlist1 = [
  { trackId: 'a', artist: 'Artist1', title: 'Song A', votes: 10, bpm: 120 },
  { trackId: 'b', artist: 'Artist2', title: 'Song B', votes: 5, bpm: 110 }
];
const playlist2 = [
  { trackId: 'c', artist: 'Artist1', title: 'Song C', votes: 8, bpm: 125 },
  { trackId: 'a', artist: 'Artist1', title: 'Song A', votes: 10, bpm: 120 } // Duplicate
];

const allPlaylists = [playlist1, playlist2];

const finalSchedule = remixPlaylist(allPlaylists, 1);
console.log(finalSchedule);
// Expected output:
// [
//   { slot: 1, trackId: 'a' },
//   { slot: 2, trackId: 'b' }
// ]
// Note: 'Song C' is removed by quota, second 'Song A' by deduping.
