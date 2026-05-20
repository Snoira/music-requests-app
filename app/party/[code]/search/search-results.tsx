import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify/server";
import { TrackResult } from "./track-result";

type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
};

export async function SearchResults({
  code,
  query,
}: {
  code: string;
  query: string;
}) {
  const supabase = await createClient();

  // RLS allows this read because the guest is a member of the party.
  const { data: party, error: partyError } = await supabase
    .from("parties")
    .select("id, host_id, status")
    .eq("join_code", code)
    .single();

  if (partyError || !party) {
    return <ErrorMessage message="Party not found." />;
  }

  if (party.status !== "active") {
    return <ErrorMessage message="This party has ended." />;
  }

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "10",
    market: "SE",
  });

  const res = await spotifyFetch(party.host_id, `/search?${params.toString()}`);

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "(no body)");
    console.error("Spotify search failed", {
      status: res.status,
      statusText: res.statusText,
      body: bodyText,
      hostId: party.host_id,
    });
    return (
      <ErrorMessage
        message={`Couldn't reach Spotify (${res.status}). Check server logs.`}
      />
    );
  }

  const data = await res.json();
  const tracks: SpotifyTrack[] = data.tracks?.items ?? [];

  if (tracks.length === 0) {
    return <p className="mt-4 text-gray-500">{`No results for "${query}"`}</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {tracks.map((track) => (
        <TrackResult
          key={track.id}
          track={track}
          partyId={party.id}
          code={code}
        />
      ))}
    </ul>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-4 text-red-700">{message}</p>;
}
