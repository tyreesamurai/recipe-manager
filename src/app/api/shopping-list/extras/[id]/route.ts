import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const result = await api.shoppingList.deleteExtra(numId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
