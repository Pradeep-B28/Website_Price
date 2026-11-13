// LOCKED. Do not edit by hand inside Antigravity. Price data for The Website Price Tag.
// To update prices once a year: change numbers here only, then run  node tools/verify.mjs
// and update the locked hashes it prints. No DOM, no network, no storage.
//
// All amounts are Indian rupees, before GST, for a build by an agency in India in 2026.
// low  = what a small studio would usually quote
// high = what an established agency would usually quote
// Every amount is a multiple of 1,000. Weeks are working weeks.
// basis "src" = the range is taken from the sources listed in SOURCES.
// basis "est" = estimated from the gap between published tiers in those same sources.

export const PRICE_YEAR = 2026;

export const SOURCES = {
  hostinger: "https://www.hostinger.com/in/tutorials/website-cost",
  nodeascend: "https://nodeascend-website.pages.dev/blog/website-cost-india-2026",
  ravirai: "https://dev.to/buildbyravirai/website-development-cost-in-india-2026-real-prices-from-a-dev-agency-kb1"
};

// Skills in the order they are shown. Every quote starts with BASE_SKILLS.
export const SKILLS = [
  "html", "css", "responsive", "js", "git", "deploy", "uiux", "seo",
  "react", "node", "database", "auth", "payments", "apis", "realtime", "ai"
];
export const BASE_SKILLS = ["html", "css", "responsive", "js", "git", "deploy"];

// Yearly running costs (sources: hostinger, nodeascend).
export const YEARLY = {
  domain: [500, 1500],
  hosting: { static: [2000, 5000], basic: [3000, 12000], app: [6000, 20000] },
  upkeepPct: [10, 15]
};

export const TIERS = ["small", "mid", "large"];
export const DEFAULT_TIER = "mid";

export const GROUPS = ["content", "look", "users", "money", "connect"];

// pages = pages included in the base price. includes = features that come with this type at no extra cost.
export const TYPES = [
  { id: "landing", low: 10000, high: 25000, weeks: [1, 2], pages: 1, includes: [], host: "static", skills: [], basis: "src", src: ["nodeascend", "ravirai"] },
  { id: "portfolio", low: 15000, high: 35000, weeks: [1, 3], pages: 4, includes: [], host: "static", skills: [], basis: "src", src: ["ravirai", "hostinger"] },
  { id: "event", low: 10000, high: 30000, weeks: [1, 2], pages: 3, includes: [], host: "static", skills: [], basis: "est", src: ["nodeascend"] },
  { id: "business", low: 25000, high: 75000, weeks: [2, 4], pages: 6, includes: ["seo"], host: "basic", skills: [], basis: "src", src: ["nodeascend", "hostinger"] },
  { id: "restaurant", low: 25000, high: 70000, weeks: [2, 4], pages: 5, includes: [], host: "basic", skills: [], basis: "est", src: ["nodeascend"] },
  { id: "school", low: 30000, high: 80000, weeks: [3, 5], pages: 8, includes: [], host: "basic", skills: [], basis: "est", src: ["nodeascend", "hostinger"] },
  { id: "blog", low: 35000, high: 75000, weeks: [3, 5], pages: 8, includes: ["cms", "seo"], host: "basic", skills: ["database"], basis: "src", src: ["nodeascend"] },
  { id: "bookingSite", low: 75000, high: 150000, weeks: [5, 8], pages: 5, includes: ["booking"], host: "app", skills: ["node", "database"], basis: "est", src: ["nodeascend"] },
  { id: "store", low: 60000, high: 200000, weeks: [4, 8], pages: 8, includes: ["payments", "search", "login", "adminPanel"], host: "app", skills: ["node", "database"], basis: "src", src: ["nodeascend", "hostinger"] },
  { id: "property", low: 75000, high: 200000, weeks: [5, 10], pages: 8, includes: ["search", "adminPanel"], host: "app", skills: ["node", "database"], basis: "est", src: ["nodeascend"] },
  { id: "news", low: 75000, high: 250000, weeks: [5, 10], pages: 10, includes: ["cms", "search", "seo"], host: "app", skills: ["node", "database"], basis: "est", src: ["nodeascend", "hostinger"] },
  { id: "courses", low: 100000, high: 300000, weeks: [8, 14], pages: 8, includes: ["login", "payments", "adminPanel"], host: "app", skills: ["react", "node", "database"], basis: "est", src: ["ravirai", "hostinger"] },
  { id: "saas", low: 80000, high: 300000, weeks: [8, 20], pages: 5, includes: ["login", "adminPanel"], host: "app", skills: ["react", "node", "database"], basis: "src", src: ["ravirai", "hostinger"] },
  { id: "marketplace", low: 250000, high: 600000, weeks: [12, 24], pages: 10, includes: ["login", "roles", "adminPanel", "search", "payments"], host: "app", skills: ["react", "node", "database"], basis: "src", src: ["hostinger"] },
  { id: "community", low: 250000, high: 800000, weeks: [14, 28], pages: 8, includes: ["login", "roles", "adminPanel", "liveChat"], host: "app", skills: ["react", "node", "database"], basis: "est", src: ["hostinger", "ravirai"] }
];

// kind "add":     a fixed amount, low to high.
// kind "count":   low to high for each unit, from 0 up to max units. weeks are per unit.
// kind "percent": low and high are percentages of the build (base plus all added features).
export const FEATURES = [
  { id: "pages", group: "content", kind: "count", low: 2000, high: 4000, max: 30, weeks: [0.25, 0.5], skills: ["html", "css"], basis: "est", src: ["nodeascend"] },
  { id: "cms", group: "content", kind: "add", low: 15000, high: 40000, weeks: [1, 2], skills: ["database", "auth"], basis: "src", src: ["hostinger"] },
  { id: "content", group: "content", kind: "add", low: 5000, high: 30000, weeks: [1, 2], skills: [], basis: "src", src: ["hostinger"] },
  { id: "seo", group: "content", kind: "add", low: 5000, high: 15000, weeks: [0.5, 1], skills: ["seo"], basis: "est", src: ["ravirai", "nodeascend"] },
  { id: "multilang", group: "content", kind: "percent", low: 15, high: 25, weeks: [1, 2], skills: ["js"], basis: "src", src: ["ravirai"] },

  { id: "customDesign", group: "look", kind: "percent", low: 30, high: 50, weeks: [1, 3], skills: ["uiux", "css"], basis: "src", src: ["ravirai"] },
  { id: "animations", group: "look", kind: "add", low: 10000, high: 25000, weeks: [0.5, 1], skills: ["css", "js"], basis: "est", src: ["nodeascend"] },
  { id: "logo", group: "look", kind: "add", low: 5000, high: 25000, weeks: [0.5, 1], skills: ["uiux"], basis: "src", src: ["hostinger"] },

  { id: "login", group: "users", kind: "add", low: 15000, high: 40000, weeks: [1, 2], skills: ["auth", "node", "database"], basis: "est", src: ["ravirai"] },
  { id: "roles", group: "users", kind: "add", low: 30000, high: 80000, weeks: [2, 4], skills: ["auth", "database"], basis: "est", src: ["ravirai"] },
  { id: "adminPanel", group: "users", kind: "add", low: 20000, high: 60000, weeks: [1, 3], skills: ["react", "node", "database"], basis: "src", src: ["ravirai"] },
  { id: "liveChat", group: "users", kind: "add", low: 60000, high: 150000, weeks: [3, 6], skills: ["realtime", "node", "database"], basis: "est", src: ["ravirai"] },

  { id: "payments", group: "money", kind: "add", low: 8000, high: 25000, weeks: [0.5, 1], skills: ["payments", "node"], basis: "src", src: ["ravirai"] },
  { id: "subscriptions", group: "money", kind: "add", low: 30000, high: 60000, weeks: [2, 3], skills: ["payments", "node", "database"], basis: "est", src: ["ravirai"] },
  { id: "booking", group: "money", kind: "add", low: 20000, high: 50000, weeks: [1, 3], skills: ["node", "database"], basis: "est", src: ["nodeascend"] },

  { id: "whatsapp", group: "connect", kind: "add", low: 8000, high: 25000, weeks: [0.5, 1], skills: ["apis"], basis: "src", src: ["ravirai"] },
  { id: "tools", group: "connect", kind: "count", low: 8000, high: 25000, max: 5, weeks: [0.5, 1], skills: ["apis", "node"], basis: "src", src: ["ravirai"] },
  { id: "search", group: "connect", kind: "add", low: 10000, high: 30000, weeks: [1, 2], skills: ["js", "database"], basis: "est", src: ["nodeascend"] },
  { id: "ai", group: "connect", kind: "add", low: 30000, high: 80000, weeks: [2, 3], skills: ["ai", "apis", "node"], basis: "est", src: ["ravirai"] },
  { id: "analytics", group: "connect", kind: "add", low: 3000, high: 10000, weeks: [0.25, 0.5], skills: ["js"], basis: "est", src: ["hostinger"] },
  { id: "migration", group: "connect", kind: "add", low: 10000, high: 30000, weeks: [1, 2], skills: ["database"], basis: "src", src: ["ravirai"] }
];

// The sample used by "Try a sample". At the mid-size tier it must come to exactly 1,20,000.
// order is the order the sample switches features on, so the meter ticks up one by one.
export const SAMPLE = {
  type: "restaurant",
  order: ["pages", "pages", "logo", "whatsapp", "booking"],
  tier: "mid",
  expect: 120000
};
