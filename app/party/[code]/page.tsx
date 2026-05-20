import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PartyHeader } from "./party-header";
import { SearchLink } from "./search-link";
import { NowPlaying } from "./now-playing";
import { QueueList } from "./queue-list";

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
    <main>
      <Suspense fallback={<PageSkeleton />}>
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
    .select("id, name, status, join_code, auto_approve, host_id")
    .eq("id", partyId!)
    .single();

  if (!party) {
    return <ErrorBanner message={ERROR_MESSAGES.unknown} />;
  }

  return (
    <>
      <PartyHeader party={party} />

      <SearchLink code={code} />
      <Suspense fallback={null}>
        <NowPlaying hostId={party.host_id} />
      </Suspense>
      <Suspense fallback={<QueueSkeleton />}>
        <QueueList partyId={party.id} />
      </Suspense>
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

function PageSkeleton() {
  return (
    <>
      <div className="h-48 w-full animate-pulse bg-gray-200 md:h-64 " />
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </>
  );
}

function QueueSkeleton() {
  return (
    <ul className="mt-4 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
      ))}
    </ul>
  );
}
