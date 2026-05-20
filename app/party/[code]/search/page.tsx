import { Suspense } from "react";
import { SearchInput } from "./search-input";
import { SearchResults } from "./search-results";

export default function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main className="p-4 mx-auto max-w-2xl">
      <Suspense fallback={null}>
        <SearchPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { code: rawCode } = await params;
  const { q } = await searchParams;
  const code = rawCode.toUpperCase();
  const query = q?.trim() ?? "";

  return (
    <>
      <SearchInput code={code} initialQuery={query} />
      {query.length >= 3 && (
        <Suspense fallback={<ResultsLoading />}>
          <SearchResults code={code} query={query} />
        </Suspense>
      )}
    </>
  );
}

function ResultsLoading() {
  return (
    <ul className="mt-4 space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
      ))}
    </ul>
  );
}
