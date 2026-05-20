import { submitRequest } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ListPlusIcon } from "@hugeicons/core-free-icons";

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

export function TrackResult({
  track,
  partyId,
  code,
}: {
  track: Track;
  partyId: string;
  code: string;
}) {
  const artists = track.artists.map((a) => a.name).join(", ");
  const albumArt =
    track.album.images.find((img) => img.width <= 64)?.url ??
    track.album.images[track.album.images.length - 1]?.url ??
    "";

  return (
    <li className="flex items-center gap-3 p-2">
      {albumArt && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={albumArt}
          alt=""
          className="h-12 w-12 flex-shrink-0 "
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{track.name}</p>
        <p className="truncate text-xs text-gray-500">{artists}</p>
      </div>
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
        <button
          type="submit"
          className="rounded-md px-3 py-1 text-sm font-medium text-white "
        >
          <HugeiconsIcon
            icon={ListPlusIcon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      </form>
    </li>
  );
}
