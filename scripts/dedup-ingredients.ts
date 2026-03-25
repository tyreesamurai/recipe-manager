/**
 * One-time deduplication script for ingredients and recipe name reporting.
 * Run with: bun scripts/dedup-ingredients.ts
 */

import { sql } from "drizzle-orm";
import { db } from "../src/db/index";

// ── Ingredient dedup ──────────────────────────────────────────────────────────

console.log("=== Ingredient Deduplication ===\n");

// Find all similar pairs (lower-id = canonical)
const pairs = await db.execute(sql`
  SELECT
    a.id   AS canonical_id,
    a.name AS canonical_name,
    b.id   AS dup_id,
    b.name AS dup_name,
    round(similarity(lower(a.name), lower(b.name))::numeric, 3) AS sim
  FROM ingredients a
  CROSS JOIN ingredients b
  WHERE a.id < b.id
    AND similarity(lower(a.name), lower(b.name)) > 0.75
  ORDER BY a.id, sim DESC
`);

if (pairs.rows.length === 0) {
  console.log("No duplicate ingredients found.\n");
} else {
  console.log(`Found ${pairs.rows.length} similar pair(s):\n`);
  for (const row of pairs.rows) {
    console.log(
      `  "${row.canonical_name}"  ←  "${row.dup_name}"  (similarity: ${row.sim})`,
    );
  }
  console.log();

  const merged = new Set<number>();

  for (const row of pairs.rows) {
    const canonicalId = row.canonical_id as number;
    const dupId = row.dup_id as number;

    if (merged.has(dupId)) continue; // already handled transitively

    // Re-point recipe_ingredients rows that won't conflict
    await db.execute(sql`
      UPDATE recipe_ingredients
      SET ingredient_id = ${canonicalId}
      WHERE ingredient_id = ${dupId}
        AND NOT EXISTS (
          SELECT 1 FROM recipe_ingredients ri2
          WHERE ri2.recipe_id    = recipe_ingredients.recipe_id
            AND ri2.ingredient_id = ${canonicalId}
        )
    `);

    // Delete any remaining recipe_ingredients rows pointing to the dup
    await db.execute(sql`
      DELETE FROM recipe_ingredients WHERE ingredient_id = ${dupId}
    `);

    // Delete the duplicate ingredient
    await db.execute(sql`
      DELETE FROM ingredients WHERE id = ${dupId}
    `);

    merged.add(dupId);
    console.log(`  ✓ Merged "${row.dup_name}" → "${row.canonical_name}"`);
  }

  console.log(`\nTotal merged: ${merged.size} ingredient(s).\n`);
}

// ── Recipe name similarity report ─────────────────────────────────────────────

console.log("=== Similar Recipe Names (for review — not auto-merged) ===\n");

const recipePairs = await db.execute(sql`
  SELECT
    a.id   AS id1,
    a.name AS name1,
    b.id   AS id2,
    b.name AS name2,
    round(similarity(lower(a.name), lower(b.name))::numeric, 3) AS sim
  FROM recipes a
  CROSS JOIN recipes b
  WHERE a.id < b.id
    AND similarity(lower(a.name), lower(b.name)) > 0.85
  ORDER BY sim DESC
`);

if (recipePairs.rows.length === 0) {
  console.log("No suspiciously similar recipe names found.\n");
} else {
  console.log(`Found ${recipePairs.rows.length} pair(s) — review manually:\n`);
  for (const row of recipePairs.rows) {
    console.log(
      `  [${row.id1}] "${row.name1}"  ~  [${row.id2}] "${row.name2}"  (${row.sim})`,
    );
  }
  console.log();
}

console.log("Done.");
process.exit(0);
