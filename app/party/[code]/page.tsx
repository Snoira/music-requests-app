import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "We couldn't find that party. Check the code and try again.",
  party_ended: "This party has ended.",
  unknown: "Something went wrong. Please try again.",
};

function mapPgError(code?: string): keyof typeof ERROR_MESSAGES {
  switch (code) {
    case "P0002":
      return "invalid_code";
    case "P0003":
      return "party_ended";
    default:
      return "unknown";
  }
}

export default function PartyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <main className="p-8">
      <Suspense fallback={<PartyLoading />}>
        <PartyContent params={params} />
      </Suspense>
    </main>
  );
}

export async function PartyContent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  const supabase = await createClient();

  // Middleware has already ensured we have a session.
  // Idempotently join the party (no-op if already a member).
  const { data: partyId, error: joinError } = await supabase.rpc("join_party", {
    p_join_code: code,
  });

  if (joinError) {
    const key = mapPgError(joinError.code);
    return <ErrorBanner message={ERROR_MESSAGES[key]} />;
  }

  // RLS now permits this read because the user is a member.
  const { data: party } = await supabase
    .from("parties")
    .select("id, name, status, auto_approve")
    .eq("id", partyId!)
    .single();

  if (!party) {
    return <ErrorBanner message={ERROR_MESSAGES.unknown} />;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{party.name}</h1>
      <p className="text-sm text-gray-600">
        Status: {party.status}
        {party.auto_approve ? " · auto-approve on" : ""}
      </p>
      <p className="mt-4 text-gray-500">Request submission UI coming next…</p>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-red-900">
      {message}
    </div>
  );
}

function PartyLoading() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-1/3 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
    </div>
  );
}
