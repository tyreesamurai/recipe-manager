import { NextResponse } from "next/server";
import { parseRecipeFromHtml } from "@/lib/import-recipe";
import { withAuth } from "@/lib/route-auth";

export async function POST(request: Request) {
  const deny = await withAuth(request);
  if (deny) return deny;

  let url: string;
  try {
    const body = await request.json();
    url = body.url;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json(
      { error: "Only http/https URLs are supported" },
      { status: 400 },
    );
  }

  // Fetch the page server-side (avoids CORS, allows full HTML access)
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RecipeImporter/1.0; +https://recipes.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page (HTTP ${res.status})` },
        { status: 422 },
      );
    }

    html = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Could not reach that URL: ${msg}` },
      { status: 422 },
    );
  }

  const data = parseRecipeFromHtml(html, url);

  if (!data) {
    return NextResponse.json(
      {
        error:
          "No recipe data found on this page. The site may not use standard recipe markup (schema.org/Recipe).",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
