// 6L. Sources UI (3 source links & full range disclosure)
import { SOURCES } from "./engine/prices.js";
import { TYPES, FEATURES, shortINR } from "./engine/pricing.js";
import { t } from "./copy.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initSourcesUI(container) {
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const card = el("div", "card sources-card");
  card.appendChild(el("p", "sources-body", t("sources.body")));
  card.appendChild(el("p", "sources-checked", t("sources.checked")));

  // 3 Authoritative Source Links
  const linksBox = el("div", "sources-links-list");
  const sourceKeys = ["hostinger", "nodeascend", "ravirai"];
  sourceKeys.forEach((key) => {
    const url = SOURCES[key];
    const name = t(`sources.names.${key}`);
    const a = el("a", "source-link", name);
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    linksBox.appendChild(a);
  });
  card.appendChild(linksBox);

  // "Show every range" disclosure (<details>)
  const details = el("details", "sources-details");
  const summary = el("summary", "sources-summary", "Show every range");
  details.appendChild(summary);

  const tableWrapper = el("div", "sources-table-wrapper");
  const table = el("div", "sources-items-grid");

  // Types section
  table.appendChild(el("div", "sources-grid-header", "Website Types"));
  TYPES.forEach((type) => {
    const row = el("div", "sources-grid-row");
    row.appendChild(el("span", "item-name", t(`types.${type.id}.name`)));
    row.appendChild(el("span", "item-range", `${shortINR(type.low)} to ${shortINR(type.high)}`));
    const badge = el("span", "item-basis", type.basis === "src" ? t("sources.sourced") : t("sources.estimated"));
    badge.classList.add(type.basis === "src" ? "basis-src" : "basis-est");
    row.appendChild(badge);
    table.appendChild(row);
  });

  // Features section
  table.appendChild(el("div", "sources-grid-header", "Features"));
  FEATURES.forEach((f) => {
    const row = el("div", "sources-grid-row");
    row.appendChild(el("span", "item-name", t(`features.${f.id}.name`)));
    const rangeText = f.kind === "percent"
      ? `+${f.low}% to ${f.high}%`
      : `${shortINR(f.low)} to ${shortINR(f.high)}`;
    row.appendChild(el("span", "item-range", rangeText));
    const badge = el("span", "item-basis", f.basis === "src" ? t("sources.sourced") : t("sources.estimated"));
    badge.classList.add(f.basis === "src" ? "basis-src" : "basis-est");
    row.appendChild(badge);
    table.appendChild(row);
  });

  tableWrapper.appendChild(table);
  details.appendChild(tableWrapper);
  card.appendChild(details);

  container.appendChild(card);
}
