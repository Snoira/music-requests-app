import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default function HostPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your parties</h1>
        <Link
          href="/host/parties/new"
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white"
        >
          New party
        </Link>
      </div>
      <Suspense fallback={<PartiesLoading />}>
        <PartiesList />
      </Suspense>
    </main>
  );
}

async function PartiesList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // middleware should prevent this, but defensive

  const { data: parties } = await supabase
    .from('parties')
    .select('id, name, join_code, status, created_at')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  if (!parties || parties.length === 0) {
    return (
      <p className="text-gray-500">
        You haven&#39;t created any parties yet. Create your first one to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {parties.map((p) => (
        <li key={p.id}>
          <Link
            href={`/party/${p.join_code}`}
            className="block rounded-md border p-3 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{p.name}</span>
              <span className="font-mono text-sm text-gray-500">{p.join_code}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {p.status === 'active' ? '● Active' : 'Ended'}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PartiesLoading() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="h-16 animate-pulse rounded-md bg-gray-100" />
      ))}
    </ul>
  );
}