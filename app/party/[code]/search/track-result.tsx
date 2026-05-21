import { submitRequest } from "./actions";
import { SubmitButton } from "./submit-button";

type Track = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: {
    images: { url: string; width: number; height: number }[];
  };
};

type TrackResultProps = {
  track: Track;
  partyId: string;
  code: string;
};

export function TrackResult({ track, partyId, code }: TrackResultProps) {
  const artists = track.artists.map((a) => a.name).join(", ");

  const albumArt =
    track.album.images.find((img) => img.width <= 64)?.url ??
    track.album.images.at(-1)?.url ??
    "";

  return (
    <li>
      <form action={submitRequest}>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="party_id" value={partyId} />
        <input type="hidden" name="track_id" value={track.id} />
        <input type="hidden" name="track_uri" value={track.uri} />
        <input type="hidden" name="track_name" value={track.name} />
        <input type="hidden" name="artist_name" value={artists} />
        <input type="hidden" name="album_art_url" value={albumArt} />
        <input
          type="hidden"
          name="duration_ms"
          value={String(track.duration_ms)}
        />

        <SubmitButton
          trackName={track.name}
          artists={artists}
          albumArt={albumArt}
        />
      </form>
    </li>
  );
}