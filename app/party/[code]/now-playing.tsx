import { spotifyFetch } from "@/lib/spotify/server";

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  duration_ms: number;
};

type CurrentlyPlaying = {
  is_playing: boolean;
  item: SpotifyTrack | null;
};

export async function NowPlaying({ hostId }: { hostId: string }) {
  let data: CurrentlyPlaying | null = null;
  try {
    const res = await spotifyFetch(hostId, "/me/player/currently-playing");
    if (res.status === 204) return null; // nothing playing
    if (!res.ok) return null;
    data = (await res.json()) as CurrentlyPlaying;
  } catch {
    // Token expired/revoked, no credentials, network glitch — fail silently.
    return null;
  }

  if (!data?.item) return null;

  const track = data.item;
  const albumArt =
    track.album.images.find((img) => img.width <= 80)?.url ??
    track.album.images.at(-1)?.url ??
    "";
  const artists = track.artists.map((a) => a.name).join(", ");

  return (
    <section className="mt-6 max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mx-4">
        Now Playing
      </p>
      <div className="mt-2 flex items-center gap-3 px-4 py-2">
        {albumArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={albumArt} alt="" className="h-12 w-12 " />
        )}
        <div className="min-w-0 flex-1">
          {data.is_playing ? (
            <span className="flex items-center min-w-0">
              <span className="flex h-3 w-3 mr-2" aria-label="Playing">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <p className="truncate font-medium text-green-500">
                {track.name}
              </p>
            </span>
          ) : (
            <p className="truncate font-medium">{track.name}</p>
          )}
          <p className="truncate text-sm text-gray-600">{artists}</p>
        </div>
      </div>
    </section>
  );
}
