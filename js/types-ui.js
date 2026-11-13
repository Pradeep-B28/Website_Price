// 6E. Step 1: Website Types UI
import { TYPES, shortINR } from "./engine/pricing.js";
import { t } from "./copy.js";

export function createIcon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (className) svg.setAttribute("class", className);
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#i-${name}`);
  svg.appendChild(use);
  return svg;
}

export function initTypesUI(container, onSelect) {
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const grid = document.createElement("div");
  grid.className = "types-cards-grid";

  TYPES.forEach((type, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "type-card";
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    card.dataset.id = type.id;
    if (index >= 8) card.classList.add("type-card-extra");

    // Check badge
    const badge = document.createElement("div");
    badge.className = "type-check-badge";
    badge.appendChild(createIcon("check", "icon-check"));
    card.appendChild(badge);

    // Icon & Header
    const top = document.createElement("div");
    top.className = "type-card-top";
    top.appendChild(createIcon(type.id, "type-icon"));
    card.appendChild(top);

    // Name & Desc
    const name = document.createElement("div");
    name.className = "type-name";
    name.textContent = t(`types.${type.id}.name`);
    card.appendChild(name);

    const desc = document.createElement("div");
    desc.className = "type-desc";
    desc.textContent = t(`types.${type.id}.desc`);
    card.appendChild(desc);

    // Meta details
    const meta = document.createElement("div");
    meta.className = "type-meta";

    const range = document.createElement("div");
    range.className = "type-range";
    range.textContent = t("typeStep.range", {
      low: shortINR(type.low),
      high: shortINR(type.high)
    });
    meta.appendChild(range);

    const weeks = document.createElement("div");
    weeks.className = "type-weeks";
    weeks.textContent = t("typeStep.weeks", {
      low: type.weeks[0],
      high: type.weeks[1]
    });
    meta.appendChild(weeks);

    const pages = document.createElement("div");
    pages.className = "type-pages";
    const pagesKey = type.pages === 1 ? "typeStep.pagesOne" : "typeStep.pagesMany";
    pages.textContent = t(pagesKey, { pages: type.pages });
    meta.appendChild(pages);

    card.appendChild(meta);

    card.addEventListener("click", () => {
      if (onSelect) onSelect(type.id);
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Phone "Show all 15" button
  const toggleRow = document.createElement("div");
  toggleRow.className = "types-toggle-row";
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "btn btn-secondary types-toggle-btn";
  toggleBtn.textContent = `Show all ${TYPES.length}`;
  toggleBtn.addEventListener("click", () => {
    grid.classList.add("show-all");
    toggleRow.classList.add("is-hidden");
  });
  toggleRow.appendChild(toggleBtn);
  container.appendChild(toggleRow);
}

export function renderTypesUI(container, pick) {
  if (!container) return;
  const cards = container.querySelectorAll(".type-card");
  cards.forEach((card) => {
    const isSelected = card.dataset.id === pick.type;
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    if (isSelected) {
      card.classList.add("is-selected");
    } else {
      card.classList.remove("is-selected");
    }
  });

  // Update Stepper Step 1
  const step1 = document.getElementById("step-pill-1");
  const step2 = document.getElementById("step-pill-2");
  const fill = document.getElementById("stepper-line-fill");

  if (step1) {
    if (pick.type) {
      step1.classList.add("done");
      step1.classList.remove("active");
      const badge = step1.querySelector(".step-badge");
      if (badge && !badge.querySelector("svg")) {
        while (badge.firstChild) badge.removeChild(badge.firstChild);
        badge.appendChild(createIcon("check", "icon-stepper-check"));
      }
    } else {
      step1.classList.remove("done");
      step1.classList.add("active");
      const badge = step1.querySelector(".step-badge");
      if (badge) badge.textContent = "1";
    }
  }

  if (step2) {
    if (pick.type) {
      step2.classList.add("active");
    } else {
      step2.classList.remove("active", "done");
    }
  }

  if (fill) {
    fill.style.width = pick.type ? "50%" : "0%";
  }
}
