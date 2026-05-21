import { createClient } from "@/lib/supabase/server";

type RequestRow = {
  id: string;
  track_name: string;
  artist_name: string;
  album_art_url: string | null;
  duration_ms: number | null;
};

export async function QueueList({ partyId }: { partyId: string }) {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, track_name, artist_name, album_art_url, duration_ms")
    .eq("party_id", partyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<RequestRow[]>();

  if (!requests || requests.length === 0) {
    return (
      <section className="mt-6 mx-4 md:mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mx-4">
          Up Next
        </p>
        <p className="mt-2 text-sm text-gray-500 mx-4">
          No songs queued yet. Be the first to request one!
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 md:mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mx-4">
        Up Next
      </p>
      <ul className="mt-2 divide-y ">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2">
            {r.album_art_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.album_art_url}
                alt=""
                className="h-12 w-12 flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.track_name}</p>
              <p className="truncate text-xs text-gray-500">{r.artist_name}</p>
            </div>
            {r.duration_ms && (
              <span className="text-xs tabular-nums text-gray-400">
                {formatDuration(r.duration_ms)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
