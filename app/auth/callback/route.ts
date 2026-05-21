import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/host";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createRouteHandlerClient(request, response);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(
        error?.message ?? "auth_failed"
      )}`
    );
  }

  const { provider_token, provider_refresh_token, expires_in, user } = {
    provider_token: data.session.provider_token,
    provider_refresh_token: data.session.provider_refresh_token,
    expires_in: 3600,
    user: data.user,
  };

  if (!provider_token || !provider_refresh_token || !user) {
    return NextResponse.redirect(`${origin}/sign-in?error=no_spotify_tokens`);
  }

  const admin = createServiceRoleClient();
  const { error: upsertError } = await admin
    .from("spotify_credentials")
    .upsert({
      user_id: user.id,
      access_token: provider_token,
      refresh_token: provider_refresh_token,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      scope: "user-modify-playback-state user-read-playback-state",
      updated_at: new Date().toISOString(),
    });

  if (upsertError) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent("token_save_failed")}`
    );
  }
  return response;
}
