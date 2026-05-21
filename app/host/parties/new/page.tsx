import { Suspense } from "react";
import Link from "next/link";
import { createParty } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  name_required: "Please enter a party name.",
  create_failed: "Could not create the party. Please try again.",
};

export default function NewPartyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link
        href="/host"
        className=" inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Tillbaka
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Skapa en spellista</h1>
      <Suspense fallback={null}>
        <FormError searchParams={searchParams} />
      </Suspense>
      <PartyForm />
    </main>
  );
}

async function FormError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  const message = ERROR_MESSAGES[error] ?? "Something went wrong.";
  return (
    <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-900">
      {message}
    </div>
  );
}

function PartyForm() {
  return (
    <form action={createParty} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Namn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="Önskelista"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-green-500 px-4 py-2 font-medium text-white"
      >
        Create party
      </button>
    </form>
  );
}
