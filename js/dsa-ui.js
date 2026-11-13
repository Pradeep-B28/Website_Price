// 6K. How it works UI (DSA explanation cards with live values)
import { CONFIG } from "../config.js";
import { formatINR, emptyPick, setType, setTier, quote } from "./engine/pricing.js";
import { t } from "./copy.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initDSAUI(container) {
  if (!container || !CONFIG.features?.howItWorks) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const grid = el("div", "dsa-cards-grid");

  const cards = [
    { key: "map", title: t("dsa.mapTitle"), desc: t("dsa.map") },
    { key: "sum", title: t("dsa.sumTitle"), desc: t("dsa.sum") },
    { key: "sort", title: t("dsa.sortTitle"), desc: t("dsa.sort") },
    { key: "set", title: t("dsa.setTitle"), desc: t("dsa.set") }
  ];

  cards.forEach((c) => {
    const card = el("div", "card dsa-card");
    card.dataset.key = c.key;
    card.appendChild(el("h4", "dsa-card-title", c.title));
    card.appendChild(el("p", "dsa-card-desc", c.desc));
    const live = el("div", "dsa-card-live", t("dsa.idle"));
    live.id = `dsa-live-${c.key}`;
    card.appendChild(live);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

export function renderDSAUI(container, pick, q) {
  if (!container || !CONFIG.features?.howItWorks) return;
  const isReady = Boolean(pick?.type && q?.ok);

  const mapLive = document.getElementById("dsa-live-map");
  const sumLive = document.getElementById("dsa-live-sum");
  const sortLive = document.getElementById("dsa-live-sort");
  const setLive = document.getElementById("dsa-live-set");

  if (!isReady) {
    if (mapLive) mapLive.textContent = t("dsa.idle");
    if (sumLive) sumLive.textContent = t("dsa.idle");
    if (sortLive) sortLive.textContent = t("dsa.idle");
    if (setLive) setLive.textContent = t("dsa.idle");
    return;
  }

  const partsCount = q.lines.length + q.included.length;

  if (mapLive) {
    mapLive.textContent = t("dsa.mapLive", { count: partsCount });
  }

  if (sumLive) {
    const basePick = setTier(setType(emptyPick(), pick.type).pick, pick.tier).pick;
    const baseQ = quote(basePick);
    sumLive.textContent = t("dsa.sumLive", {
      base: formatINR(baseQ.price),
      total: formatINR(q.price)
    });
  }

  if (sortLive) {
    const topItem = q.byCost[0];
    const topName = topItem.kind === "base"
      ? t(`types.${topItem.id}.name`)
      : t(`features.${topItem.id}.name`);
    sortLive.textContent = t("dsa.sortLive", { name: topName });
  }

  if (setLive) {
    setLive.textContent = t("dsa.setLive", {
      parts: partsCount,
      count: q.skills.length
    });
  }
}
