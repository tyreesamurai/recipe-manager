import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function GET(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const result = await api.shoppingList.getExtras();
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ extras: result.data });
}

export async function POST(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const body = await request.json();
  const { name, quantity, unit } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const result = await api.shoppingList.addExtra(
    name,
    typeof quantity === "number" ? quantity : undefined,
    typeof unit === "string" ? unit : undefined,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ extra: result.data });
}
