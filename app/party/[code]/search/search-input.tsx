"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";

export function SearchInput({
  code,
  initialQuery,
}: {
  code: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const qs = params.toString();
      startTransition(() => {
        router.replace(`/party/${code}/search${qs ? `?${qs}` : ""}`);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, code, router]);

  return (
    <div className="sticky top-0 z-10 bg-white pb-2">
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song..."
        className="w-full rounded-md border px-4 py-3 text-base"
      />
    </div>
  );
}
