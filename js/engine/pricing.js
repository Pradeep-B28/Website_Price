// LOCKED. Do not edit. Website Price Tag engine: no DOM, no network, no storage.
// A pick is what the visitor chose. Picks are never changed in place:
// every change returns a new pick, so undo and saving stay simple.
//
// pick = { type: string | null, on: string[], counts: { pages: number, tools: number }, tier: "small" | "mid" | "large" }

import { TYPES, FEATURES, GROUPS, TIERS, DEFAULT_TIER, SKILLS, BASE_SKILLS, YEARLY, SAMPLE } from "./prices.js";

export { TYPES, FEATURES, GROUPS, TIERS, SKILLS, SAMPLE };
export const REASONS = ["unknown", "noType", "included", "range"];
export const LIMITS = { codeLength: 400, meterSteps: 40 };

// Hash maps for O(1) lookups by id.
const TYPE_BY_ID = new Map(TYPES.map((t) => [t.id, t]));
const FEATURE_BY_ID = new Map(FEATURES.map((f) => [f.id, f]));
const FEATURE_ORDER = new Map(FEATURES.map((f, i) => [f.id, i]));
const COUNT_IDS = FEATURES.filter((f) => f.kind === "count").map((f) => f.id);
const SKILL_ORDER = new Map(SKILLS.map((s, i) => [s, i]));

export const getType = (id) => TYPE_BY_ID.get(id) ?? null;
export const getFeature = (id) => FEATURE_BY_ID.get(id) ?? null;
export const featuresInGroup = (group) => FEATURES.filter((f) => f.group === group);
export const isIncluded = (typeId, featureId) => !!getType(typeId)?.includes.includes(featureId);

const round1000 = (n) => Math.round(n / 1000) * 1000;
const sortByOrder = (ids) => [...new Set(ids)].sort((a, b) => FEATURE_ORDER.get(a) - FEATURE_ORDER.get(b));
const freeze = (pick) => Object.freeze({ ...pick, on: Object.freeze([...pick.on]), counts: Object.freeze({ ...pick.counts }) });

export function emptyPick() {
  const counts = {};
  for (const id of COUNT_IDS) counts[id] = 0;
  return freeze({ type: null, on: [], counts, tier: DEFAULT_TIER });
}

// Choosing a type drops any switched-on feature that this type already includes, so nothing is charged twice.
export function setType(pick, typeId) {
  const type = getType(typeId);
  if (!type) return { pick, reason: "unknown" };
  const on = pick.on.filter((id) => !type.includes.includes(id));
  return { pick: freeze({ ...pick, type: typeId, on }), reason: null };
}

export function toggleFeature(pick, featureId) {
  const f = getFeature(featureId);
  if (!f || f.kind === "count") return { pick, reason: "unknown" };
  if (!pick.type) return { pick, reason: "noType" };
  if (isIncluded(pick.type, featureId)) return { pick, reason: "included" };
  const on = pick.on.includes(featureId) ? pick.on.filter((id) => id !== featureId) : sortByOrder([...pick.on, featureId]);
  return { pick: freeze({ ...pick, on }), reason: null };
}

export function setCount(pick, featureId, n) {
  const f = getFeature(featureId);
  if (!f || f.kind !== "count") return { pick, reason: "unknown" };
  if (!pick.type) return { pick, reason: "noType" };
  if (!Number.isInteger(n) || n < 0 || n > f.max) return { pick, reason: "range" };
  return { pick: freeze({ ...pick, counts: { ...pick.counts, [featureId]: n } }), reason: null };
}

export function setTier(pick, tier) {
  if (!TIERS.includes(tier)) return { pick, reason: "unknown" };
  return { pick: freeze({ ...pick, tier }), reason: null };
}

export function isOn(pick, featureId) {
  const f = getFeature(featureId);
  if (!f || !pick.type) return false;
  if (isIncluded(pick.type, featureId)) return true;
  if (f.kind === "count") return pick.counts[featureId] > 0;
  return pick.on.includes(featureId);
}

// The full price for a pick. Every number on the page comes from here.
export function quote(pick) {
  const type = getType(pick?.type);
  if (!type) return { ok: false, reason: "noType" };

  const lines = [{ id: type.id, kind: "base", count: 1, low: type.low, high: type.high, included: false }];
  const weeks = [type.weeks[0], type.weeks[1]];
  const skills = new Set([...BASE_SKILLS, ...type.skills]);
  const included = [];

  for (const id of type.includes) {
    included.push(id);
    for (const s of getFeature(id).skills) skills.add(s);
  }

  // Running sums: fixed amounts first, then percentages of that build.
  let subLow = type.low;
  let subHigh = type.high;
  const percents = [];
  for (const f of FEATURES) {
    if (type.includes.includes(f.id)) continue;
    if (f.kind === "count") {
      const n = pick.counts?.[f.id] ?? 0;
      if (!n) continue;
      lines.push({ id: f.id, kind: "count", count: n, low: f.low * n, high: f.high * n, included: false });
      subLow += f.low * n;
      subHigh += f.high * n;
      weeks[0] += f.weeks[0] * n;
      weeks[1] += f.weeks[1] * n;
    } else if (pick.on?.includes(f.id)) {
      if (f.kind === "percent") {
        percents.push(f);
      } else {
        lines.push({ id: f.id, kind: "add", count: 1, low: f.low, high: f.high, included: false });
        subLow += f.low;
        subHigh += f.high;
      }
      weeks[0] += f.weeks[0];
      weeks[1] += f.weeks[1];
    } else {
      continue;
    }
    for (const s of f.skills) skills.add(s);
  }

  let totalLow = subLow;
  let totalHigh = subHigh;
  for (const f of percents) {
    const low = round1000((subLow * f.low) / 100);
    const high = round1000((subHigh * f.high) / 100);
    lines.push({ id: f.id, kind: "percent", count: 1, low, high, pct: [f.low, f.high], included: false });
    totalLow += low;
    totalHigh += high;
  }

  for (const line of lines) line.mid = (line.low + line.high) / 2;
  // Sorting: biggest cost first, ties keep their list order.
  const order = new Map(lines.map((l, i) => [l, i]));
  const byCost = [...lines].sort((a, b) => b.mid - a.mid || order.get(a) - order.get(b));

  const total = { low: totalLow, mid: round1000((totalLow + totalHigh) / 2), high: totalHigh };
  const host = YEARLY.hosting[type.host];
  const yearly = {
    low: round1000(YEARLY.domain[0] + host[0] + (total.low * YEARLY.upkeepPct[0]) / 100),
    high: round1000(YEARLY.domain[1] + host[1] + (total.high * YEARLY.upkeepPct[1]) / 100)
  };
  const tier = TIERS.includes(pick.tier) ? pick.tier : DEFAULT_TIER;
  const price = tier === "small" ? total.low : tier === "large" ? total.high : total.mid;

  return {
    ok: true,
    type: type.id,
    tier,
    price,
    total,
    subtotal: { low: subLow, high: subHigh },
    lines,
    byCost,
    drivers: byCost.slice(0, 3).map((l) => l.id),
    extras: lines.length - 1,
    included,
    weeks: { low: Math.max(1, Math.ceil(weeks[0])), high: Math.max(1, Math.ceil(weeks[1])) },
    yearly,
    skills: [...skills].sort((a, b) => SKILL_ORDER.get(a) - SKILL_ORDER.get(b)),
    pages: type.pages + (type.includes.includes("pages") ? 0 : pick.counts?.pages ?? 0)
  };
}

// Taxi meter: the values the meter shows on its way from one price to the next.
// Always ends exactly on "to", never includes "from", every value is a multiple of 1,000.
export function meterSteps(from, to, maxSteps = LIMITS.meterSteps) {
  const ok = (n) => Number.isFinite(n) && n >= 0 && n % 1000 === 0;
  if (!ok(from) || !ok(to) || from === to) return [];
  const units = Math.abs(to - from) / 1000;
  const step = Math.ceil(units / Math.max(1, maxSteps)) * 1000;
  const dir = to > from ? 1 : -1;
  const out = [];
  for (let v = from + dir * step; dir > 0 ? v < to : v > to; v += dir * step) out.push(v);
  out.push(to);
  return out;
}

// Indian digit grouping: 120000 -> "1,20,000".
export function formatINR(n) {
  if (!Number.isFinite(n)) return "0";
  const s = String(Math.round(Math.abs(n)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

// Short form for chips: 25000 -> "25k", 120000 -> "1.2L".
export function shortINR(n) {
  if (!Number.isFinite(n) || n < 1000) return formatINR(n);
  const trim = (x, d) => String(Number(x.toFixed(d)));
  if (n < 100000) return `${trim(n / 1000, 1)}k`;
  return `${trim(n / 100000, 2)}L`;
}

// Saving and share links. Example: "t=store&f=logo,seo&pages=2&tools=0&tier=mid"
export function encodePick(pick) {
  const parts = [`t=${pick.type ?? ""}`, `f=${sortByOrder(pick.on).join(",")}`];
  for (const id of COUNT_IDS) parts.push(`${id}=${pick.counts?.[id] ?? 0}`);
  parts.push(`tier=${TIERS.includes(pick.tier) ? pick.tier : DEFAULT_TIER}`);
  return parts.join("&");
}

// Never trusts the input. Unknown values are dropped. Returns null when the text is not a pick at all.
export function decodePick(text) {
  if (typeof text !== "string") return null;
  const raw = text.replace(/^#/, "");
  if (!raw || raw.length > LIMITS.codeLength || !/^[\w=&,.-]+$/.test(raw)) return null;
  const map = new Map();
  for (const part of raw.split("&")) {
    const i = part.indexOf("=");
    if (i < 1) return null;
    map.set(part.slice(0, i), part.slice(i + 1));
  }
  if (!map.has("t")) return null;
  let pick = emptyPick();
  const typeId = map.get("t");
  if (typeId) {
    const r = setType(pick, typeId);
    if (r.reason) return null;
    pick = r.pick;
    for (const id of (map.get("f") ?? "").split(",")) {
      const f = getFeature(id);
      if (!f || f.kind === "count" || pick.on.includes(id) || isIncluded(pick.type, id)) continue;
      pick = toggleFeature(pick, id).pick;
    }
    for (const id of COUNT_IDS) {
      const n = Number(map.get(id) ?? "0");
      const r2 = setCount(pick, id, Number.isInteger(n) ? n : 0);
      if (!r2.reason) pick = r2.pick;
    }
  }
  pick = setTier(pick, map.get("tier") ?? DEFAULT_TIER).pick;
  return pick;
}

// The sample, one change at a time, so the meter can tick up step by step. Last pick is the full sample.
export function samplePicks() {
  let pick = setType(emptyPick(), SAMPLE.type).pick;
  pick = setTier(pick, SAMPLE.tier).pick;
  const picks = [pick];
  for (const id of SAMPLE.order) {
    const f = getFeature(id);
    pick = f.kind === "count" ? setCount(pick, id, pick.counts[id] + 1).pick : toggleFeature(pick, id).pick;
    picks.push(pick);
  }
  return picks;
}
