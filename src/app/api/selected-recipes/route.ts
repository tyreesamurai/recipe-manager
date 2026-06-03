import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function GET(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const result = await api.shoppingList.getSelected();
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ recipes: result.data });
}

export async function POST(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { recipeId } = await request.json();
  if (typeof recipeId !== "number") {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }
  const result = await api.shoppingList.addSelected(recipeId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const body = await request.json().catch(() => ({}));
  if (body.clear) {
    const result = await api.shoppingList.clearSelected();
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  }
  if (typeof body.recipeId !== "number") {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }
  const result = await api.shoppingList.removeSelected(body.recipeId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
