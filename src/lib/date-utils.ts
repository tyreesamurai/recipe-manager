/**
 * Date utilities for the planner.
 *
 * All functions operate in LOCAL time — never UTC — so that the displayed
 * day matches the user's wall clock regardless of their UTC offset.
 * (Using toISOString() would flip the date at 8 PM EST because it converts
 * to midnight UTC first.)
 */

/** Format a Date as YYYY-MM-DD using the local timezone. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Return the Monday that starts the week containing `date`.
 * Time components are zeroed in local time.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow; // shift back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return a new Date that is `n` days after (or before, if negative) `date`. */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Short display label, e.g. "Jun 3". */
export function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Full week range label, e.g. "June 2 – June 8, 2025". */
export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const s = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const e = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${s} – ${e}`;
}
