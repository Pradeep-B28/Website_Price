// Checks for The Website Price Tag. Run from the project folder:  node tools/verify.mjs
//
// It checks, without a browser:
//   1. the price data: ids, ranges, weeks, sources, skills
//   2. exact prices for fixed picks, including the sample (must be exactly 1,20,000)
//   3. every engine rule: types, features, counts, tiers, included features
//   4. 3,000 random picks: totals add up, ranges hold, saving and loading give back the same pick
//   5. the taxi meter steps, rupee formats and damaged saved data
//   6. js/copy.js and config.js: every id has words, text rules
//   7. the locked engine files have not been changed
//   8. privacy and writing rules across every file built so far
// Prints PASS or FAIL lines and exits with code 1 if anything fails.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const toUrl = (file) => pathToFileURL(join(ROOT, file)).href;
const E = await import(toUrl("js/engine/pricing.js"));
const P = await import(toUrl("js/engine/prices.js"));
const { COPY, t } = await import(toUrl("js/copy.js"));
const { CONFIG } = await import(toUrl("config.js"));

let passes = 0;
let fails = 0;
const check = (ok, label) => {
  if (ok) passes += 1;
  else {
    fails += 1;
    console.log(`FAIL ${label}`);
  }
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pickOf = (type, on = [], counts = {}, tier = "mid") => {
  let p = E.setType(E.emptyPick(), type).pick;
  for (const id of on) p = E.toggleFeature(p, id).pick;
  for (const [id, n] of Object.entries(counts)) p = E.setCount(p, id, n).pick;
  return E.setTier(p, tier).pick;
};

// 1. Price data.
const typeIds = P.TYPES.map((x) => x.id);
const featureIds = P.FEATURES.map((x) => x.id);
check(new Set(typeIds).size === typeIds.length && typeIds.length === 15, "15 unique types");
check(new Set(featureIds).size === featureIds.length && featureIds.length === 21, "21 unique features");
const srcIds = Object.keys(P.SOURCES);
for (const x of P.TYPES) {
  check(x.low > 0 && x.low < x.high && x.low % 1000 === 0 && x.high % 1000 === 0, `type ${x.id}: range`);
  check(x.weeks[0] >= 1 && x.weeks[0] <= x.weeks[1], `type ${x.id}: weeks`);
  check(Number.isInteger(x.pages) && x.pages >= 1, `type ${x.id}: pages`);
  check(x.includes.every((id) => P.FEATURES.find((f) => f.id === id)?.kind === "add"), `type ${x.id}: includes only add features`);
  check(["static", "basic", "app"].includes(x.host), `type ${x.id}: host`);
  check(x.skills.every((s) => P.SKILLS.includes(s)), `type ${x.id}: skills`);
  check(["src", "est"].includes(x.basis) && x.src.length > 0 && x.src.every((s) => srcIds.includes(s)), `type ${x.id}: sources`);
}
for (const f of P.FEATURES) {
  check(P.GROUPS.includes(f.group), `feature ${f.id}: group`);
  check(["add", "count", "percent"].includes(f.kind), `feature ${f.id}: kind`);
  check(f.low > 0 && f.low < f.high, `feature ${f.id}: range`);
  if (f.kind !== "percent") check(f.low % 1000 === 0 && f.high % 1000 === 0, `feature ${f.id}: multiples of 1,000`);
  else check(f.high <= 100, `feature ${f.id}: percent`);
  if (f.kind === "count") check(Number.isInteger(f.max) && f.max >= 1, `feature ${f.id}: max`);
  check(f.weeks[0] > 0 && f.weeks[0] <= f.weeks[1], `feature ${f.id}: weeks`);
  check(f.skills.every((s) => P.SKILLS.includes(s)), `feature ${f.id}: skills`);
  check(["src", "est"].includes(f.basis) && f.src.length > 0 && f.src.every((s) => srcIds.includes(s)), `feature ${f.id}: sources`);
}
check(P.GROUPS.every((g) => P.FEATURES.some((f) => f.group === g)), "every group has features");
check(Object.values(P.SOURCES).every((u) => /^https:\/\//.test(u)), "source links are https");
check(P.BASE_SKILLS.every((s) => P.SKILLS.includes(s)), "base skills");

// 2. Exact prices.
const sample = E.samplePicks();
const sq = E.quote(sample[sample.length - 1]);
check(sample.length === P.SAMPLE.order.length + 1, "sample: one pick per step");
check(sq.price === 120000 && sq.total.mid === 120000 && sq.price === P.SAMPLE.expect, `sample price ${sq.price}`);
check(sq.total.low === 62000 && sq.total.high === 178000, `sample range ${sq.total.low} to ${sq.total.high}`);
check(sq.weeks.low === 5 && sq.weeks.high === 10, `sample weeks ${sq.weeks.low} to ${sq.weeks.high}`);
check(sq.yearly.low === 10000 && sq.yearly.high === 40000, `sample yearly ${sq.yearly.low} to ${sq.yearly.high}`);
check(same(sq.drivers, ["restaurant", "booking", "whatsapp"]), `sample drivers ${sq.drivers}`);
check(same(sq.byCost.map((l) => l.id), ["restaurant", "booking", "whatsapp", "logo", "pages"]), "sample receipt order");
check(same(sq.skills, ["html", "css", "responsive", "js", "git", "deploy", "uiux", "node", "database", "apis"]), `sample skills ${sq.skills}`);
check(sq.extras === 4 && sq.pages === 7, `sample extras ${sq.extras}, pages ${sq.pages}`);
for (let i = 1; i < sample.length; i += 1) check(E.quote(sample[i]).price > E.quote(sample[i - 1]).price, `sample step ${i} ticks up`);

const landing = E.quote(pickOf("landing"));
check(landing.total.low === 10000 && landing.total.mid === 18000 && landing.total.high === 25000, "landing alone");
check(landing.weeks.low === 1 && landing.weeks.high === 2 && landing.extras === 0, "landing weeks");
const storeCustom = E.quote(pickOf("store", ["customDesign"]));
check(storeCustom.total.low === 78000 && storeCustom.total.high === 300000 && storeCustom.total.mid === 189000, "store with custom design");
check(same(storeCustom.included, ["payments", "search", "login", "adminPanel"]), "store included list");
const biz = E.quote(pickOf("business", ["multilang", "customDesign"], { pages: 3 }));
check(biz.total.low === 45000 && biz.total.high === 153000 && biz.total.mid === 99000, `business mix ${biz.total.low} ${biz.total.mid} ${biz.total.high}`);
check(same(biz.lines.filter((l) => l.kind === "percent").map((l) => [l.id, l.low, l.high]), [["multilang", 5000, 22000], ["customDesign", 9000, 44000]]), "percent lines rounded");
const tiers = ["small", "mid", "large"].map((tier) => E.quote(pickOf("restaurant", ["logo", "whatsapp", "booking"], { pages: 2 }, tier)).price);
check(same(tiers, [62000, 120000, 178000]), `tier prices ${tiers}`);

// 3. Engine rules.
const empty = E.emptyPick();
check(Object.isFrozen(empty) && Object.isFrozen(empty.on) && Object.isFrozen(empty.counts), "picks are frozen");
check(E.quote(empty).ok === false && E.quote(empty).reason === "noType", "no type, no quote");
check(E.toggleFeature(empty, "logo").reason === "noType", "toggle needs a type");
check(E.setCount(empty, "pages", 1).reason === "noType", "count needs a type");
check(E.setType(empty, "spaceship").reason === "unknown", "unknown type");
const st = pickOf("store");
check(E.toggleFeature(st, "payments").reason === "included" && E.isOn(st, "payments"), "included feature stays on");
check(E.toggleFeature(st, "pages").reason === "unknown", "count features use setCount");
check(E.toggleFeature(st, "nope").reason === "unknown", "unknown feature");
check(E.setCount(st, "pages", 31).reason === "range" && E.setCount(st, "pages", -1).reason === "range" && E.setCount(st, "pages", 1.5).reason === "range", "count range");
check(E.setCount(st, "tools", 5).reason === null && E.setCount(st, "tools", 6).reason === "range", "tools max 5");
check(E.setTier(st, "huge").reason === "unknown", "unknown tier");
const biz2 = pickOf("business", ["payments", "search", "logo"]);
const moved = E.setType(biz2, "store").pick;
check(same(moved.on, ["logo"]), "switching type drops features it includes");
check(E.toggleFeature(E.toggleFeature(biz2, "logo").pick, "logo").pick.on.includes("logo"), "toggle twice is back on");
check(same(E.toggleFeature(biz2, "cms").pick.on, ["cms", "logo", "payments", "search"]), "features stay in list order");
check(!E.isOn(biz2, "cms") && E.isOn(biz2, "logo") && E.isOn(pickOf("business"), "seo"), "isOn");
check(biz2.on.length === 3 && E.toggleFeature(biz2, "cms").pick !== biz2 && biz2.on.length === 3, "changes return a new pick");

// 4. Random picks.
let seed = 20261113;
const rand = (n) => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed % n;
};
const addIds = P.FEATURES.filter((f) => f.kind !== "count").map((f) => f.id);
for (let i = 0; i < 3000; i += 1) {
  let p = E.setType(E.emptyPick(), typeIds[rand(typeIds.length)]).pick;
  for (const id of addIds) if (rand(3) === 0) p = E.toggleFeature(p, id).pick;
  p = E.setCount(p, "pages", rand(31)).pick;
  p = E.setCount(p, "tools", rand(6)).pick;
  p = E.setTier(p, P.TIERS[rand(3)]).pick;
  const q = E.quote(p);
  const tag = `random ${i} ${E.encodePick(p)}`;
  check(q.ok && q.total.low <= q.total.mid && q.total.mid <= q.total.high, `${tag}: low <= mid <= high`);
  check([q.total.low, q.total.mid, q.total.high, q.yearly.low, q.yearly.high, q.price].every((n) => n % 1000 === 0), `${tag}: multiples of 1,000`);
  check(q.lines.reduce((s, l) => s + l.low, 0) === q.total.low && q.lines.reduce((s, l) => s + l.high, 0) === q.total.high, `${tag}: lines add up`);
  check(q.price === (p.tier === "small" ? q.total.low : p.tier === "large" ? q.total.high : q.total.mid), `${tag}: tier price`);
  check(q.weeks.low <= q.weeks.high && q.yearly.low <= q.yearly.high, `${tag}: weeks and yearly`);
  check(new Set(q.skills).size === q.skills.length && q.skills.every((s, k) => k === 0 || P.SKILLS.indexOf(q.skills[k - 1]) < P.SKILLS.indexOf(s)), `${tag}: skills unique and ordered`);
  check(q.byCost.every((l, k) => k === 0 || q.byCost[k - 1].mid >= l.mid), `${tag}: receipt sorted`);
  check(q.lines.every((l) => l.kind === "base" || !E.getType(p.type).includes.includes(l.id)), `${tag}: nothing charged twice`);
  const back = E.decodePick(E.encodePick(p));
  check(back && same(back, p), `${tag}: save and load`);
  const off = addIds.filter((id) => !E.isOn(p, id) && P.FEATURES.find((f) => f.id === id).kind === "add");
  if (off.length) {
    const more = E.quote(E.toggleFeature(p, off[rand(off.length)]).pick);
    check(more.total.low > q.total.low && more.total.high > q.total.high, `${tag}: adding a feature costs more`);
  }
}

// 5. Meter, formats, damaged data.
const steps = E.meterSteps(0, 120000, 40);
check(steps.length <= 41 && steps[steps.length - 1] === 120000 && !steps.includes(0), "meter up");
check(steps.every((v, i) => v % 1000 === 0 && (i === 0 || v > steps[i - 1])), "meter up is smooth");
const down = E.meterSteps(178000, 62000, 40);
check(down[down.length - 1] === 62000 && down.every((v, i) => i === 0 || v < down[i - 1]), "meter down");
check(same(E.meterSteps(5000, 5000), []) && same(E.meterSteps(0, 1000), [1000]) && same(E.meterSteps(-5, 1000), []) && same(E.meterSteps(0, 1500), []), "meter edge cases");
for (let i = 0; i < 300; i += 1) {
  const a = rand(900) * 1000;
  const b = rand(900) * 1000;
  const m = 1 + rand(60);
  const s = E.meterSteps(a, b, m);
  check(a === b ? s.length === 0 : s.length <= m + 1 && s[s.length - 1] === b, `meter random ${a} ${b} ${m}`);
}
const inr = [[0, "0"], [999, "999"], [1000, "1,000"], [62000, "62,000"], [120000, "1,20,000"], [1780000, "17,80,000"], [12345678, "1,23,45,678"]];
for (const [n, s] of inr) check(E.formatINR(n) === s, `formatINR ${n}`);
const short = [[8000, "8k"], [12500, "12.5k"], [75000, "75k"], [120000, "1.2L"], [250000, "2.5L"], [1000000, "10L"], [500, "500"]];
for (const [n, s] of short) check(E.shortINR(n) === s, `shortINR ${n} gave ${E.shortINR(n)}`);
const bad = ["", "abc", "t=nope", "t=store&f=<script>", "x".repeat(500), "t=store&&", "=store", null, 42, {}];
for (const b of bad) check(E.decodePick(b) === null, `damaged data rejected: ${String(b).slice(0, 20)}`);
const fixed = E.decodePick("t=store&f=logo,payments,zzz,logo&pages=99&tools=2&tier=gold");
check(fixed && same(fixed.on, ["logo"]) && fixed.counts.pages === 0 && fixed.counts.tools === 2 && fixed.tier === "mid", "damaged parts dropped");
check(same(E.decodePick("#t=&f=&pages=0&tools=0&tier=small"), E.setTier(E.emptyPick(), "small").pick), "empty pick with hash");

// 6. Copy and config.
for (const x of P.TYPES) check(!!COPY.types[x.id]?.name && !!COPY.types[x.id]?.desc, `type copy: ${x.id}`);
for (const f of P.FEATURES) {
  check(!!COPY.features[f.id]?.name && !!COPY.features[f.id]?.desc, `feature copy: ${f.id}`);
  if (f.kind === "count") check(!!COPY.features[f.id].one && !!COPY.features[f.id].many, `feature units: ${f.id}`);
}
for (const g of P.GROUPS) check(!!COPY.groups[g], `group copy: ${g}`);
for (const tr of P.TIERS) check(!!COPY.tiers[tr]?.name && !!COPY.tiers[tr]?.desc, `tier copy: ${tr}`);
for (const s of P.SKILLS) check(!!COPY.skills.names[s], `skill copy: ${s}`);
for (const r of E.REASONS) check(!!COPY.reasons[r], `reason copy: ${r}`);
check(same(Object.keys(COPY.sources.names).sort(), srcIds.sort()), "every source has a name");
check(t("receipt.endPrice", { price: E.formatINR(sq.price) }) === "₹1,20,000 to get this made.", "end line");
check(t("receipt.endLearn") === "Or learn to build it yourself.", "end line two");
check(t("nope.nothing") === "" && t("meter.range", { low: "1" }) === "Range ₹1 to ₹{high}", "t() fills values");
check(typeof CONFIG.program.name === "string" && CONFIG.program.name.length > 10, "config program name");
check(/^(\d{11,15})?$/.test(CONFIG.salesWhatsApp), "config WhatsApp number is digits only");
check(CONFIG.siteUrl === "" || /^https:\/\/[^/]+(\/[^/]+)*$/.test(CONFIG.siteUrl), "config siteUrl has no slash at the end");
check(Number.isInteger(CONFIG.meter.maxSteps) && CONFIG.meter.maxSteps >= 5 && CONFIG.meter.tickMs >= 10, "config meter");

const BANNED = /\b(stupid|dumb|useless|guarantee\w*|placement\w*|salary|lakhs?|get hired|seats left|100% accurate|cheapest|best price)\b/i;
const strings = [];
const walkCopy = (node) => (typeof node === "string" ? strings.push(node) : Object.values(node).forEach(walkCopy));
walkCopy(COPY);
for (const s of strings) {
  check(!BANNED.test(s), `copy banned word: ${s}`);
  check(!/[‒-―]/.test(s), `copy long dash: ${s}`);
  check(!/(?![©®™₹])\p{Extended_Pictographic}/u.test(s), `copy emoji: ${s}`);
}

// 7. Locked files.
const LOCKED = {
  "js/engine/prices.js": "170381ae5897289faf5a7f7023c09e9cc0f613c2a440d44535323150d3a5e32b",
  "js/engine/pricing.js": "4d52e18bc0d191b1cd00427a7cee08158d31ac37f04af362199e953d18e87580"
};
for (const [file, hash] of Object.entries(LOCKED)) {
  const now = createHash("sha256").update(read(file)).digest("hex");
  check(now === hash, `${file} was changed. It is locked. Undo the change. (hash ${now.slice(0, 12)})`);
}

// 8. Privacy and writing rules across everything built so far.
const SKIP_DIRS = new Set(["node_modules", ".git", ".vercel", "tools", ".gemini"]);
const walk = (dir) => readdirSync(join(ROOT, dir || "."), { withFileTypes: true }).flatMap((e) => {
  const path = dir ? `${dir}/${e.name}` : e.name;
  if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(path);
  return /\.(js|html|css|md|json)$/.test(e.name) ? [path] : [];
});
const files = walk("");
const NEVER = [
  ["fetch", /\bfetch\(/], ["XMLHttpRequest", /XMLHttpRequest/], ["sendBeacon", /sendBeacon/], ["WebSocket", /WebSocket/],
  ["EventSource", /EventSource/], ["innerHTML", /innerHTML|outerHTML|insertAdjacentHTML/],
  ["document.write", /document\.write/], ["eval", /\beval\(|new Function\(/],
  ["console output", /console\.\w+\(/], ["analytics", /googletagmanager|gtag\(|fbq\(|connect\.facebook|clarity\.ms|hotjar/i],
  ["outside file", /<(script|link)[^>]+(src|href)=["']https?:/i], ["web font", /fonts\.googleapis|@import\s+url\(["']?http/i],
  ["alert, confirm or prompt box", /\b(window\.)?(alert|confirm|prompt)\(/]
];
const STORAGE_FILES = new Set(["js/store.js", "js/theme-init.js", "js/selftest.js"]);
for (const file of files) {
  const body = read(file);
  if (/\.(js|html|css)$/.test(file)) {
    for (const [name, re] of NEVER) check(!re.test(body), `${file}: ${name} is not allowed`);
    if (!STORAGE_FILES.has(file)) check(!/localStorage|sessionStorage|indexedDB/.test(body), `${file}: storage is only allowed in js/store.js`);
    if (!file.startsWith("js/engine/") && file !== "js/selftest.js") {
      check(!/\b\d{1,2},\d{2},\d{3}\b/.test(body), `${file}: a rupee amount is typed by hand. Prices come only from the engine`);
    }
  }
  check(!/[‒-―]/.test(body), `${file}: long dash found`);
  if (!file.endsWith(".md")) check(!/(?![©®™₹])\p{Extended_Pictographic}/u.test(body), `${file}: emoji found`);
}
for (const file of ["js/store.js", "js/theme-init.js"]) {
  if (!existsSync(join(ROOT, file))) continue;
  const keys = [...read(file).matchAll(/["'`](wpt-[\w-]+)["'`]/g)].map((x) => x[1]);
  check(keys.every((k) => ["wpt-theme", "wpt-pick", "wpt-intro-seen"].includes(k)), `${file} keys: ${keys}`);
}
const CSP = JSON.parse(read("vercel.json")).headers[0].headers.find((h) => h.key === "Content-Security-Policy").value;
check(CSP.includes("connect-src 'none'") && CSP.includes("script-src 'self'") && CSP.includes("frame-src 'none'"), "vercel.json lock");
if (existsSync(join(ROOT, "index.html"))) {
  const html = read("index.html");
  check(/<meta[^>]+Content-Security-Policy[^>]+connect-src 'none'/i.test(html) && /<meta[^>]+Content-Security-Policy[^>]+script-src 'self';/i.test(html), "index.html: CSP meta tag missing");
  check(!/\sstyle=/i.test(html), "index.html: inline style attribute is not allowed");
  check(!/\son[a-z]+=/i.test(html), "index.html: inline event handler is blocked by the lock");
  check(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), "index.html: inline script is blocked by the lock");
  check(!/<style\b/i.test(html), "index.html: style tag is not allowed");
  check(!/<iframe\b/i.test(html), "index.html: no iframes");
  check(/<html[^>]+lang=["']en["']/i.test(html), "index.html: lang=\"en\"");
  check(/<meta[^>]+name=["']viewport["'][^>]+width=device-width/i.test(html), "index.html: viewport meta");
}

console.log(`${passes} checks passed, ${fails} failed (${files.length} files scanned)`);
console.log(fails ? "RESULT: FAILED" : "RESULT: ALL PASS");
process.exit(fails ? 1 : 0);
