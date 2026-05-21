'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateJoinCode(length = 6): string {
  return Array.from({ length }, () =>
    JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)],
  ).join('');
}

export async function createParty(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (!name) {
    redirect('/host/parties/new?error=name_required');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/host/parties/new');
  }

  // Retry on collision (extremely unlikely with 32^6 codes, but cheap to handle).
  for (let attempt = 0; attempt < 3; attempt++) {
    const joinCode = generateJoinCode();

    // auto_approve harcoded to true for now, Alice wedding time limit
    const { data: party, error } = await supabase
      .from('parties')
      .insert({
        host_id: user.id,
        name,
        join_code: joinCode,
        auto_approve: true,
      })
      .select('join_code')
      .single();

    if (!error) {
      redirect(`/party/${party.join_code}`);
    }

    // 23505 = unique_violation in Postgres
    if (error.code !== '23505') {
      console.error('Party creation failed:', error);
      redirect('/host/parties/new?error=create_failed');
    }
    // otherwise loop and try a new code
  }

  redirect('/host/parties/new?error=create_failed');
}