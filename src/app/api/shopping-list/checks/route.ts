import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function POST(request: Request) {
  const { name, checked } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const result = await api.shoppingList.toggleCheck(name, checked !== false);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
