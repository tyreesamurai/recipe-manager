import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@/lib/route-auth";

export async function GET(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  if (!week) {
    return NextResponse.json({ error: "week param required" }, { status: 400 });
  }
  const result = await api.planner.getEntries(week);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ entries: result.data });
}

export async function PUT(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { weekStart, day, mealSlot, recipeId } = await request.json();
  if (!weekStart || day == null || !mealSlot || !recipeId) {
    return NextResponse.json(
      { error: "weekStart, day, mealSlot, recipeId required" },
      { status: 400 },
    );
  }
  const result = await api.planner.addEntry(weekStart, day, mealSlot, recipeId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.data.id });
}

export async function DELETE(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const result = await api.planner.removeEntry(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
