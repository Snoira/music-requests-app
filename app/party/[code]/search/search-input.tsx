'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search02Icon } from '@hugeicons/core-free-icons';

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
      if (query.trim()) params.set('q', query.trim());
      const qs = params.toString();
      startTransition(() => {
        router.replace(`/party/${code}/search${qs ? `?${qs}` : ''}`);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, code, router]);

  return (
    <div className="sticky top-0 z-10 pb-2">
      <label
        className="flex items-center gap-3 rounded-full border bg-white px-4 py-3 text-gray-500 focus-within:border-gray-400"
      >
        <HugeiconsIcon
          icon={Search02Icon}
          size={24}
          color="currentColor"
          strokeWidth={1.5}
        />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök efter låt..."
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
        />
      </label>
    </div>
  );
}