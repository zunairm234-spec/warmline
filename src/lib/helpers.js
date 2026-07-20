export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function daysSince(dateStr) {
  if (!dateStr) return 999;
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - then) / 86400000);
  return diff < 0 ? 0 : diff;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Days-since-contact -> a "heat" bucket. This is the core signal the whole
// app is built around: the longer it's been, the colder the relationship.
export function getHeat(days) {
  if (days <= 3) return { key: "fresh", label: "Fresh" };
  if (days <= 7) return { key: "warm", label: "Warm" };
  if (days <= 14) return { key: "cooling", label: "Cooling" };
  return { key: "cold", label: "Cold" };
}

export function money(n) {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString();
}
