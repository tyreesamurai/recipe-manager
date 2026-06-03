import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function DELETE(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const result = await api.shoppingList.clear();
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
