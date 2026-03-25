/**
 * Utilities for parsing schema.org/Recipe JSON-LD from HTML into our internal
 * recipe shape. No DB or fetch calls — pure data transformation.
 */

export type ImportedRecipeData = {
  recipe: {
    name: string;
    description?: string;
    instructions?: string[];
    imageUrl?: string;
    inputUrl: string;
    servings?: number;
    nutrition?: {
      calories?: number;
      protein?: number;
      fats?: number;
      carbs?: number;
    };
    cookingTimes?: {
      prep?: number;
      cook?: number;
      total?: number;
    };
  };
  ingredients: Array<{ name: string; quantity?: number; unit?: string }>;
};

// ── Duration parsing ──────────────────────────────────────────────────────────

/** Parse ISO 8601 duration like "PT1H30M" into total minutes. */
export function parseDuration(iso: string): number | undefined {
  if (!iso) return undefined;
  const m = iso.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return undefined;
  const days = Number(m[1] ?? 0);
  const hours = Number(m[2] ?? 0);
  const minutes = Number(m[3] ?? 0);
  const total = days * 24 * 60 + hours * 60 + minutes;
  return total > 0 ? total : undefined;
}

// ── Ingredient string parsing ─────────────────────────────────────────────────

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

/** Recognised measurement units (lowercased). Maps variant → canonical. */
const UNIT_MAP: Record<string, string> = {
  cup: "cup",
  cups: "cup",
  c: "cup",
  tablespoon: "tablespoon",
  tablespoons: "tablespoon",
  tbsp: "tablespoon",
  tbs: "tablespoon",
  teaspoon: "teaspoon",
  teaspoons: "teaspoon",
  tsp: "teaspoon",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  gram: "g",
  grams: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kg: "kg",
  milliliter: "ml",
  milliliters: "ml",
  ml: "ml",
  liter: "l",
  liters: "l",
  l: "l",
  pinch: "pinch",
  pinches: "pinch",
  dash: "dash",
  dashes: "dash",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
  handful: "handful",
  handfuls: "handful",
  package: "package",
  packages: "package",
  pkg: "package",
  bunch: "bunch",
  bunches: "bunch",
  stick: "stick",
  sticks: "stick",
  large: "large",
  medium: "medium",
  small: "small",
};

function parseFraction(s: string): number {
  const trimmed = s.trim();
  if (trimmed.includes(" ")) {
    // mixed number: "1 1/2"
    const [whole, frac] = trimmed.split(" ");
    return Number(whole) + parseFraction(frac);
  }
  if (trimmed.includes("/")) {
    const [num, den] = trimmed.split("/");
    return Number(num) / Number(den);
  }
  return Number(trimmed);
}

/** Strip trailing parentheticals and comma notes: "flour, sifted" → "flour" */
function cleanName(s: string): string {
  return s
    .replace(/\(.*?\)/g, "") // remove (parentheticals)
    .split(",")[0] // take only the part before the first comma
    .trim();
}

/** Strip HTML tags from a string. */
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function parseIngredientString(raw: string): {
  name: string;
  quantity?: number;
  unit?: string;
} {
  // Normalise unicode fractions to decimal strings
  let s = raw.trim();
  for (const [glyph, val] of Object.entries(UNICODE_FRACTIONS)) {
    s = s.replaceAll(glyph, ` ${val}`);
  }
  s = s.replace(/\s+/g, " ").trim();

  // Match an optional leading number (integer, decimal, fraction, mixed)
  const numRe = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*/;
  const numMatch = s.match(numRe);

  if (!numMatch) {
    return { name: cleanName(raw) };
  }

  const quantity = parseFraction(numMatch[1].trim());
  const rest = s.slice(numMatch[0].length);

  // Check whether the first word of rest is a known unit
  const words = rest.split(/\s+/);
  const potentialUnit = words[0]?.toLowerCase().replace(/[.,]$/, "");
  const canonicalUnit = potentialUnit ? UNIT_MAP[potentialUnit] : undefined;

  if (canonicalUnit) {
    const name = cleanName(words.slice(1).join(" ") || rest);
    return { name: name || cleanName(raw), quantity, unit: canonicalUnit };
  }

  // No recognised unit — the rest IS the name
  return { name: cleanName(rest) || cleanName(raw), quantity };
}

// ── JSON-LD extraction ────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: schema.org data is untyped
type JsonLd = Record<string, any>;

function findRecipeNode(data: unknown): JsonLd | null {
  if (!data || typeof data !== "object") return null;
  const d = data as JsonLd;

  // Handle @graph wrapper
  if (Array.isArray(d["@graph"])) {
    for (const node of d["@graph"]) {
      const found = findRecipeNode(node);
      if (found) return found;
    }
    return null;
  }

  // Handle top-level array
  if (Array.isArray(d)) {
    for (const node of d) {
      const found = findRecipeNode(node);
      if (found) return found;
    }
    return null;
  }

  // Check @type
  const type = d["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
    return d;
  }

  return null;
}

function extractInstructions(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === "string") return raw ? [stripHtml(raw)] : [];

  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        const t = stripHtml(item);
        if (t) out.push(t);
      } else if (item && typeof item === "object") {
        const obj = item as JsonLd;
        if (
          obj["@type"] === "HowToSection" &&
          Array.isArray(obj.itemListElement)
        ) {
          out.push(...extractInstructions(obj.itemListElement));
        } else {
          const text = stripHtml(obj.text ?? obj.name ?? "");
          if (text) out.push(text);
        }
      }
    }
    return out;
  }

  return [];
}

function extractImage(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw || undefined;
  if (Array.isArray(raw)) {
    const first = raw[0];
    return typeof first === "string" ? first : (first as JsonLd)?.url;
  }
  if (typeof raw === "object") return (raw as JsonLd).url;
  return undefined;
}

function extractServings(raw: unknown): number | undefined {
  if (!raw) return undefined;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const m = raw.match(/\d+/);
    return m ? Number(m[0]) : undefined;
  }
  if (Array.isArray(raw)) return extractServings(raw[0]);
  return undefined;
}

function parseNutritionValue(raw: unknown): number | undefined {
  if (!raw) return undefined;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isNaN(n) ? undefined : n;
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function parseRecipeFromHtml(
  html: string,
  sourceUrl: string,
): ImportedRecipeData | null {
  // Extract all JSON-LD script blocks
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let node: JsonLd | null = null;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      node = findRecipeNode(parsed);
      if (node) break;
    } catch {
      // malformed JSON-LD — skip
    }
  }

  if (!node) return null;

  const nutrition = node.nutrition as JsonLd | undefined;

  return {
    recipe: {
      name: stripHtml(node.name ?? "Imported Recipe"),
      description: node.description ? stripHtml(node.description) : undefined,
      instructions: extractInstructions(node.recipeInstructions),
      imageUrl: extractImage(node.image),
      inputUrl: sourceUrl,
      servings: extractServings(node.recipeYield),
      nutrition: nutrition
        ? {
            calories: parseNutritionValue(nutrition.calories),
            protein: parseNutritionValue(nutrition.proteinContent),
            fats: parseNutritionValue(nutrition.fatContent),
            carbs: parseNutritionValue(nutrition.carbohydrateContent),
          }
        : undefined,
      cookingTimes:
        node.prepTime || node.cookTime || node.totalTime
          ? {
              prep: parseDuration(node.prepTime),
              cook: parseDuration(node.cookTime),
              total: parseDuration(node.totalTime),
            }
          : undefined,
    },
    ingredients: Array.isArray(node.recipeIngredient)
      ? (node.recipeIngredient as string[]).map((s) =>
          parseIngredientString(String(s)),
        )
      : [],
  };
}
