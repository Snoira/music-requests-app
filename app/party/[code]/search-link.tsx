import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search02Icon } from "@hugeicons/core-free-icons";

export function SearchLink({ code }: { code: string }) {
  return (
    <Link
      href={`/party/${code}/search`}
      className="flex items-center gap-3 rounded-full border bg-white px-4 py-3 text-gray-500 hover:bg-gray-50 mx-4"
    >
      <HugeiconsIcon
        icon={Search02Icon}
        size={24}
        color="currentColor"
        strokeWidth={1.5}
      />
      <span>Önska låt</span>
    </Link>
  );
}
