import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function DELETE() {
  const result = await api.shoppingList.clear();
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
