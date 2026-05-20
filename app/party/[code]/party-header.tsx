import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserMultiple03Icon, Key01Icon } from "@hugeicons/core-free-icons";

type Party = {
  id: string;
  name: string;
  join_code: string;
  photo_url?: string | null;
};

export async function PartyHeader({ party }: { party: Party }) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("party_guests")
    .select("*", { count: "exact", head: true })
    .eq("party_id", party.id);

  return (
    <header>
      <div className="relative h-48 w-full overflow-hidden md:h-72">
        <Image
          src={
            party.photo_url ??
            "https://images.unsplash.com/photo-1623638308822-7529ea3cf094?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          width={500}
          height={500}
          alt="Picture of the couple"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        <h1 className="text-2xl font-semibold md:text-3xl">{party.name}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center">
            <HugeiconsIcon
              icon={Key01Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
            />
            <span className="font-mono font-medium text-gray-700 ml-2">
              {party.join_code}
            </span>
          </span>
          <span aria-hidden>·</span>
          <span className="flex items-center">
            <HugeiconsIcon
              icon={UserMultiple03Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
              className="mr-2"
            />{" "}
            {count ?? 0} guest{count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </header>
  );
}
