"use server";
import { redirect } from "next/navigation";

export async function joinParty(formData: FormData) {
  const join_code = (formData.get("join_code") as string | null)?.trim() ?? "";

  if (!join_code) {
    redirect("/?error=join_code_required");
  }

  redirect(`/party/${join_code}`);
}
