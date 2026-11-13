// Self-test suite running on ?test=1 against the real page engine and DOM
import {
  TYPES, FEATURES, SAMPLE, quote, setType, toggleFeature, setCount, setTier,
  emptyPick, decodePick, encodePick, formatINR
} from "./engine/pricing.js";
import { SOURCES } from "./engine/prices.js";
import { t } from "./copy.js";
import { savePick, getSavedPick } from "./store.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function runSelfTests() {
  const results = [];
  const addResult = (id, ok, desc) => {
    results.push({ id, ok, label: `${id}. ${desc}` });
  };

  // 1. The sample ending at 1,20,000 and the end line
  try {
    let p = emptyPick();
    p = setType(p, "restaurant").pick;
    p = setCount(p, "pages", 2).pick;
    p = toggleFeature(p, "logo").pick;
    p = toggleFeature(p, "whatsapp").pick;
    p = toggleFeature(p, "booking").pick;
    p = setTier(p, "mid").pick;
    const q = quote(p);
    const endLineText = t("receipt.endPrice", { price: formatINR(q.price) });
    const ok = q.price === 120000 && endLineText === "₹1,20,000 to get this made.";
    addResult(1, ok, "The sample ends with price 1,20,000 and matching end line");
  } catch (err) {
    addResult(1, false, "Sample execution threw error");
  }

  // 2. Meter range and weeks
  try {
    let p = emptyPick();
    p = setType(p, "restaurant").pick;
    p = setCount(p, "pages", 2).pick;
    p = toggleFeature(p, "logo").pick;
    p = toggleFeature(p, "whatsapp").pick;
    p = toggleFeature(p, "booking").pick;
    const q = quote(p);
    const rangeStr = t("meter.range", { low: formatINR(q.total.low), high: formatINR(q.total.high) });
    const weeksStr = t("meter.weeks", { low: q.weeks.low, high: q.weeks.high });
    const ok = rangeStr === "Range ₹62,000 to ₹1,78,000" && weeksStr === "5 to 10 weeks to build";
    addResult(2, ok, `Range reads '${rangeStr}' and weeks '${weeksStr}'`);
  } catch (err) {
    addResult(2, false, "Meter range test failed");
  }

  // 3. Receipt lines in byCost order
  try {
    let p = emptyPick();
    p = setType(p, "restaurant").pick;
    p = setCount(p, "pages", 2).pick;
    p = toggleFeature(p, "logo").pick;
    p = toggleFeature(p, "whatsapp").pick;
    p = toggleFeature(p, "booking").pick;
    const q = quote(p);
    const expected = [
      "Base build: Restaurant or cafe",
      "Appointment booking",
      "WhatsApp chat and alerts",
      "Logo and brand kit",
      "2 extra pages"
    ];
    const actual = q.byCost.map((l) => {
      if (l.kind === "base") return t("receipt.lineBase", { type: t(`types.${l.id}.name`) });
      if (l.kind === "count") return t("receipt.lineCount", { count: l.count, unit: "extra pages" });
      return t(`features.${l.id}.name`);
    });
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    addResult(3, ok, "Receipt lines read in byCost order");
  } catch (err) {
    addResult(3, false, "Receipt lines order test failed");
  }

  // 4. Small studio 62,000 and Established agency 1,78,000
  try {
    let p = emptyPick();
    p = setType(p, "restaurant").pick;
    p = setCount(p, "pages", 2).pick;
    p = toggleFeature(p, "logo").pick;
    p = toggleFeature(p, "whatsapp").pick;
    p = toggleFeature(p, "booking").pick;
    const smallQ = quote(setTier(p, "small").pick);
    const largeQ = quote(setTier(p, "large").pick);
    const ok = smallQ.price === 62000 && largeQ.price === 178000;
    addResult(4, ok, `Small studio shows ${smallQ.price} and Established agency ${largeQ.price}`);
  } catch (err) {
    addResult(4, false, "Tier price calculation failed");
  }

  // 5. Online store shows included features locked
  try {
    let p = setType(emptyPick(), "store").pick;
    const q = quote(p);
    const inc = q.included;
    const hasAll = ["payments", "search", "login", "adminPanel"].every((id) => inc.includes(id));
    const togglePayments = toggleFeature(p, "payments");
    const ok = hasAll && togglePayments.reason === "included";
    addResult(5, ok, "Store has included features that cannot be toggled off");
  } catch (err) {
    addResult(5, false, "Store included features test failed");
  }

  // 6. Business with payments switched to store drops duplicate payments
  try {
    let p = setType(emptyPick(), "business").pick;
    p = toggleFeature(p, "payments").pick;
    const moved = setType(p, "store").pick;
    const q = quote(moved);
    const ok = !q.lines.some((l) => l.kind === "add" && l.id === "payments");
    addResult(6, ok, "Switching to store drops duplicate payment line");
  } catch (err) {
    addResult(6, false, "Duplicate feature drop test failed");
  }

  // 7. Extra pages stepper stops at 0 and at 30
  try {
    let p = setType(emptyPick(), "landing").pick;
    const belowZero = setCount(p, "pages", -1);
    const atZero = setCount(p, "pages", 0);
    const atMax = setCount(p, "pages", 30);
    const overMax = setCount(p, "pages", 31);
    const ok = belowZero.reason === "range" && atZero.reason === null && atMax.reason === null && overMax.reason === "range";
    addResult(7, ok, "Pages stepper limits enforced between 0 and 30");
  } catch (err) {
    addResult(7, false, "Stepper range limits test failed");
  }

  // 8. Before type is picked, toggling feature shows noType
  try {
    const empty = emptyPick();
    const res = toggleFeature(empty, "logo");
    const ok = res.reason === "noType";
    addResult(8, ok, "Tapping feature with no type selected returns noType");
  } catch (err) {
    addResult(8, false, "noType validation test failed");
  }

  // 9. WhatsApp share link format
  try {
    let p = setType(emptyPick(), "restaurant").pick;
    const q = quote(p);
    const shareUrl = `${window.location.origin}/#${encodePick(p)}`;
    const rawMsg = t("share.text", { price: formatINR(q.price), url: shareUrl });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(rawMsg)}`;
    const decoded = decodeURIComponent(waUrl.replace("https://wa.me/?text=", ""));
    const ok = waUrl.startsWith("https://wa.me/?text=") && decoded === rawMsg;
    addResult(9, ok, "WhatsApp share link matches encoded share.text");
  } catch (err) {
    addResult(9, false, "WhatsApp share link test failed");
  }

  // 10. Hash with sample picks decodes to 1,20,000
  try {
    const hash = "#t=restaurant&f=logo,whatsapp,booking&pages=2&tools=0&tier=mid";
    const decoded = decodePick(hash);
    const q = decoded ? quote(decoded) : null;
    const ok = q && q.price === 120000;
    addResult(10, ok, "Sample hash decodes correctly to price 1,20,000");
  } catch (err) {
    addResult(10, false, "Hash decode test failed");
  }

  // 11. Damaged hash starts fresh
  try {
    const badHash = "#t=<x>";
    const decoded = decodePick(badHash);
    const ok = decoded === null;
    addResult(11, ok, "Damaged hash returns null to start fresh");
  } catch (err) {
    addResult(11, false, "Damaged hash test failed");
  }

  // 12. Storage save and restore
  try {
    let p = setType(emptyPick(), "school").pick;
    p = toggleFeature(p, "whatsapp").pick;
    savePick(p);
    const restored = getSavedPick();
    const ok = restored && restored.type === "school" && restored.on.includes("whatsapp");
    addResult(12, ok, "Saved pick restores identically from storage");
  } catch (err) {
    addResult(12, false, "Storage reload test failed");
  }

  // 13. Allowed storage keys only
  try {
    const allowed = new Set(["wpt-theme", "wpt-pick", "wpt-intro-seen"]);
    const localKeys = Object.keys(localStorage);
    const sessionKeys = Object.keys(sessionStorage);
    const ok = localKeys.every((k) => allowed.has(k)) && sessionKeys.every((k) => allowed.has(k));
    addResult(13, ok, "Storage keys are restricted strictly to allowed whitelist");
  } catch (err) {
    addResult(13, false, "Storage key whitelist check failed");
  }

  // 14. 3 source links present and matching SOURCES
  try {
    const links = Array.from(document.querySelectorAll(".source-link"));
    const hrefs = links.map((a) => a.href);
    const expectedHrefs = Object.values(SOURCES);
    const match = expectedHrefs.every((u) => hrefs.some((h) => h.startsWith(u)));
    const rels = links.every((a) => a.rel === "noopener noreferrer" && a.target === "_blank");
    const ok = links.length === 3 && match && rels;
    addResult(14, ok, "All 3 source links present, matching SOURCES with secure rel");
  } catch (err) {
    addResult(14, false, "Source links verification failed");
  }

  // 15. Hero note, meter label, and receipt estimate note visible
  try {
    const heroNote = document.querySelector(".hero-note");
    const meterLabel = document.querySelector(".meter-label");
    const ok = Boolean(heroNote && meterLabel && heroNote.textContent.includes("Estimates") && meterLabel.textContent.includes("Estimated fare"));
    addResult(15, ok, "Hero note and meter estimate labels are visible");
  } catch (err) {
    addResult(15, false, "Estimate labels visibility test failed");
  }

  // 16. Horizontal scroll width check
  try {
    const ok = document.documentElement.scrollWidth <= window.innerWidth;
    addResult(16, ok, `No horizontal scrollbar (scrollWidth: ${document.documentElement.scrollWidth} <= innerWidth: ${window.innerWidth})`);
  } catch (err) {
    addResult(16, false, "Horizontal overflow test failed");
  }

  renderSelfTestUI(results);
  return results;
}

function renderSelfTestUI(results) {
  const existing = document.getElementById("selftest-overlay");
  if (existing) existing.remove();

  const overlay = el("div", "selftest-overlay");
  overlay.id = "selftest-overlay";

  const card = el("div", "card selftest-card");
  const passes = results.filter((r) => r.ok).length;
  const fails = results.filter((r) => !r.ok).length;

  const header = el("div", "selftest-header");
  header.appendChild(el("h2", "selftest-title", "Self-Test Suite (?test=1)"));
  const summary = el("div", fails === 0 ? "selftest-status-pass" : "selftest-status-fail",
    fails === 0 ? `ALL PASS (${passes}/${results.length})` : `${fails} FAILED (${passes}/${results.length} passed)`
  );
  header.appendChild(summary);
  card.appendChild(header);

  const list = el("div", "selftest-list");
  results.forEach((r) => {
    const row = el("div", r.ok ? "selftest-row selftest-pass" : "selftest-row selftest-fail");
    row.appendChild(el("span", "selftest-badge", r.ok ? "PASS" : "FAIL"));
    row.appendChild(el("span", "selftest-label", r.label));
    list.appendChild(row);
  });
  card.appendChild(list);

  const closeBtn = el("button", "btn btn-secondary selftest-close-btn", "Close test view");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", () => overlay.remove());
  card.appendChild(closeBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
