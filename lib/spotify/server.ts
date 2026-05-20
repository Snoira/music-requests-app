import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

export async function getValidSpotifyToken(userId: string): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data: creds, error } = await supabase
    .from("spotify_credentials")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !creds)
    throw new Error(`No Spotify credentials for user ${userId}`);

  // Refresh if expiring within 60s
  if (new Date(creds.expires_at).getTime() - Date.now() > 60_000) {
    return creds.access_token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refresh_token,
    }),
  });

  if (!res.ok) {
    // 400 invalid_grant = user revoked access; force re-OAuth
    throw new Error(`Spotify refresh failed: ${res.status}`);
  }

  const data = await res.json();
  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token ?? creds.refresh_token; // may be absent
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await supabase
    .from("spotify_credentials")
    .update({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: expiresAt,
    })
    .eq("user_id", userId);

  return newAccessToken;
}

async function invalidateCachedToken(userId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase
    .from("spotify_credentials")
    .update({ expires_at: new Date(0).toISOString() })
    .eq("user_id", userId);
}

export async function spotifyFetch(
  userId: string,
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const token = await getValidSpotifyToken(userId);

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // 401: token was invalidated server-side; force refresh once.
  if (res.status === 401 && !retried) {
    await invalidateCachedToken(userId); // set expires_at to now
    return spotifyFetch(userId, path, init, true);
  }

  // 429: respect Retry-After. Only retry once for short waits.
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
    if (retryAfter <= 5 && !retried) {
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return spotifyFetch(userId, path, init, true);
    }
    // Otherwise let the caller decide what to do.
  }

  return res;
}
