import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleArrowRight01Icon } from "@hugeicons/core-free-icons";
import { joinParty } from "./actions";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  join_code_required: "Please enter a code.",
};

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <Suspense fallback={null}>
          <FormError searchParams={searchParams} />
        </Suspense>
        <h1 className="mb-lg text-4xl font-bold tracking-tight text-heading">Häng med på fest!</h1>
        <CodeInputForm />
        <Link
          href="/host"
          className=" inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          Är du Alice eller Lukas? Klicka här!
        </Link>
      </div>
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

function CodeInputForm() {
  return (
    <form action={joinParty} className="space-y-4">
      <label className="flex items-center gap-3 rounded-full border bg-white px-4 py-3 text-gray-500 focus-within:border-gray-400">
        <input
          id="join_code"
          name="join_code"
          type="text"
          required
          placeholder="Topphemlig kod"
          autoCapitalize="characters"
          // enterKeyHint="go"
          // inputMode="text"
          autoFocus
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
        />
        <button type="submit">
          <HugeiconsIcon
            icon={CircleArrowRight01Icon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      </label>
    </form>
  );
}
