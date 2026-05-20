"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { spotifyFetch } from "@/lib/spotify/server";
import { redirect } from "next/navigation";

export async function submitRequest(formData: FormData) {
  const code = formData.get("code") as string;
  const partyId = formData.get("party_id") as string;
  const trackUri = formData.get("track_uri") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/party/${code}?error=session_lost`);
  }

  // Insert the request. RLS checks: guest is a member of an active party.
  // The auto_approve trigger may rewrite status to 'approved' before insert.
  const { data: newRow, error: insertError } = await supabase
    .from("requests")
    .insert({
      party_id: partyId,
      guest_id: user.id,
      track_id: formData.get("track_id") as string,
      track_name: formData.get("track_name") as string,
      artist_name: formData.get("artist_name") as string,
      album_art_url: (formData.get("album_art_url") as string) || null,
      duration_ms: Number(formData.get("duration_ms")) || null,
    })
    .select("id, status")
    .single();

  if (insertError) {
    redirect(`/party/${code}?error=submit_failed`);
  }

  // If the request was auto-approved, also push it into Spotify's queue.
  if (newRow.status === "approved") {
    await tryQueueTrack(partyId, trackUri);
  }

  redirect(`/party/${code}?submitted=1`);
}

async function tryQueueTrack(partyId: string, trackUri: string) {
  // We need the host's user_id to call Spotify on their behalf.
  // Service role because party_id doesn't necessarily belong to caller.
  const admin = createServiceRoleClient();
  const { data: party } = await admin
    .from("parties")
    .select("host_id")
    .eq("id", partyId)
    .single();

  if (!party) return;

  const res = await spotifyFetch(
    party.host_id,
    `/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
    { method: "POST" }
  );

  if (res.ok) return;

  // Non-fatal failures — the row is in the database; the host can retry.
  // Log them server-side so you can see what's happening.
  try {
    const body = await res.json();
    console.warn(
      "Spotify queue failed:",
      res.status,
      body?.error?.reason,
      body?.error?.message
    );
  } catch {
    console.warn("Spotify queue failed:", res.status);
  }
}
