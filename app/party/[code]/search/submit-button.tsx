"use client";

import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ListPlusIcon, Loading03Icon } from "@hugeicons/core-free-icons";

type Props = {
  trackName: string;
  artists: string;
  albumArt: string;
};

export function SubmitButton({ trackName, artists, albumArt }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={
        pending
          ? `Requesting ${trackName} by ${artists}`
          : `Request ${trackName} by ${artists}`
      }
      className="flex w-full items-center gap-3 p-2 text-left 
                transition-colors
                focus:outline-none focus-visible:ring-1
                focus-visible:ring-green-500 focus-visible:ring-offset-1
                disabled:opacity-60 
                disabled:cursor-not-allowed"
    >
      {albumArt && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={albumArt}
          alt=""
          className="h-12 w-12 shrink-0"
          loading="lazy"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{trackName}</p>
        <p className="truncate text-xs text-gray-500">{artists}</p>
      </div>

      <span className="shrink-0 text-gray-500" aria-hidden="true">
        <HugeiconsIcon
          icon={pending ? Loading03Icon : ListPlusIcon}
          size={24}
          strokeWidth={1.5}
          className={pending ? "motion-safe:animate-spin" : ""}
        />
      </span>
    </button>
  );
}
