// 6G. The Meter UI (Desktop sticky panel, mobile bottom bar, dialog sheet, ticking, fly chips)
import { CONFIG } from "../config.js";
import { formatINR, meterSteps, TIERS } from "./engine/pricing.js";
import { t } from "./copy.js";
import { createIcon } from "./types-ui.js";

let currentDisplayedPrice = 0;
let tickTimer = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initMeterUI(callbacks = {}) {
  const desktopCta = document.getElementById("meter-cta-btn");
  if (desktopCta) {
    desktopCta.addEventListener("click", (e) => {
      e.preventDefault();
      if (callbacks.onGetPriceTag) callbacks.onGetPriceTag();
    });
  }

  document.querySelectorAll(".tier-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tier && callbacks.onTier) callbacks.onTier(btn.dataset.tier);
    });
  });

  const openSheetBtn = document.getElementById("phone-meter-open-btn");
  let sheet = document.getElementById("mobile-meter-sheet");
  if (!sheet) {
    sheet = createMobileSheet(callbacks);
    document.body.appendChild(sheet);
  }

  if (openSheetBtn && sheet) {
    openSheetBtn.addEventListener("click", () => {
      if (sheet.showModal) sheet.showModal();
      else sheet.setAttribute("open", "");
    });

    const closeBtn = sheet.querySelector(".sheet-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (sheet.close) sheet.close();
        else sheet.removeAttribute("open");
        openSheetBtn.focus();
      });
    }

    sheet.addEventListener("click", (e) => {
      const rect = sheet.getBoundingClientRect();
      const inDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                       rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!inDialog) {
        if (sheet.close) sheet.close();
        else sheet.removeAttribute("open");
        openSheetBtn.focus();
      }
    });
  }
}

function createMobileSheet(callbacks) {
  const dialog = el("dialog", "meter-sheet-dialog");
  dialog.id = "mobile-meter-sheet";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", t("meter.label"));

  const inner = el("div", "meter-sheet-content");
  const header = el("div", "meter-sheet-header");
  header.appendChild(el("h3", "meter-sheet-title", t("meter.label")));

  const closeBtn = el("button", "btn-icon sheet-close-btn");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", t("meter.close"));
  closeBtn.appendChild(createIcon("close", "icon-close"));
  header.appendChild(closeBtn);
  inner.appendChild(header);

  const body = el("div", "meter-sheet-body");
  const display = el("div", "meter-display");
  display.appendChild(el("div", "meter-ghost-digits", formatINR(888888)));
  const live = el("div", "meter-live-digits");
  live.appendChild(el("span", "meter-currency", "₹"));
  const digits = el("span", "", "0");
  digits.id = "sheet-meter-digits";
  live.appendChild(digits);
  display.appendChild(live);
  body.appendChild(display);

  const range = el("div", "meter-range-line");
  range.id = "sheet-meter-range";
  const weeks = el("div", "meter-weeks-line");
  weeks.id = "sheet-meter-weeks";
  body.appendChild(range);
  body.appendChild(weeks);

  const tierSelect = el("div", "meter-tier-select");
  tierSelect.appendChild(el("div", "meter-tier-label", t("meter.tierTitle")));
  const tierSwitch = el("div", "meter-tier-pill-switch");
  tierSwitch.setAttribute("role", "radiogroup");

  TIERS.forEach((tier) => {
    const btn = el("button", "tier-opt-btn", t(`tiers.${tier}.name`));
    btn.type = "button";
    btn.dataset.tier = tier;
    btn.setAttribute("role", "radio");
    btn.addEventListener("click", () => callbacks.onTier && callbacks.onTier(tier));
    tierSwitch.appendChild(btn);
  });
  tierSelect.appendChild(tierSwitch);
  body.appendChild(tierSelect);

  const ctaBtn = el("button", "btn btn-primary meter-cta-btn", t("meter.go"));
  ctaBtn.type = "button";
  ctaBtn.addEventListener("click", () => {
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
    if (callbacks.onGetPriceTag) callbacks.onGetPriceTag();
  });
  body.appendChild(ctaBtn);

  inner.appendChild(body);
  dialog.appendChild(inner);
  return dialog;
}

export function renderMeterUI(pick, q, options = {}) {
  const hasType = Boolean(pick && pick.type);
  const targetPrice = hasType && q && q.ok ? q.price : 0;
  const targetFlag = hasType ? "on" : "idle";

  updateFlag("meter-flag", targetFlag);
  updateFlag("phone-meter-flag", targetFlag);

  const digitsEls = [
    document.getElementById("meter-digits"),
    document.getElementById("phone-meter-digits"),
    document.getElementById("sheet-meter-digits")
  ].filter(Boolean);

  if (options.immediate) {
    if (tickTimer) clearInterval(tickTimer);
    currentDisplayedPrice = targetPrice;
    digitsEls.forEach((d) => { d.textContent = formatINR(targetPrice); });
    announceMeterPrice(targetPrice);
  } else {
    tickDigits(currentDisplayedPrice, targetPrice, digitsEls);
  }

  const rangeText = !hasType ? t("meter.idle") : t("meter.range", {
    low: formatINR(q.total.low),
    high: formatINR(q.total.high)
  });
  const weeksText = !hasType ? "" : t("meter.weeks", { low: q.weeks.low, high: q.weeks.high });

  ["meter-range", "sheet-meter-range"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = rangeText;
  });
  ["meter-weeks", "sheet-meter-weeks"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = weeksText;
  });

  const baseName = document.getElementById("meter-base-name");
  if (baseName) baseName.textContent = hasType ? t(`types.${pick.type}.name`) : "None";

  const extras = document.getElementById("meter-extras-count");
  if (extras) extras.textContent = (!hasType || q.extras === 0) ? t("meter.extrasNone") : t("meter.extrasCount", { count: q.extras });

  const curTier = pick ? pick.tier : "mid";
  document.querySelectorAll(".tier-opt-btn").forEach((btn) => {
    const match = btn.dataset.tier === curTier;
    btn.setAttribute("aria-checked", match ? "true" : "false");
    btn.classList.toggle("active", match);
  });
}

function updateFlag(flagId, nextState) {
  const node = document.getElementById(flagId);
  if (!node) return;
  const label = nextState === "on" ? t("meter.flagOn") : t("meter.flagIdle");
  if (node.textContent !== label) {
    node.textContent = label;
    node.classList.remove("anim-flip");
    void node.offsetWidth;
    node.classList.add("anim-flip");
  }
}

function tickDigits(fromVal, toVal, elements) {
  if (tickTimer) clearInterval(tickTimer);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || fromVal === toVal) {
    currentDisplayedPrice = toVal;
    elements.forEach((d) => { d.textContent = formatINR(toVal); });
    announceMeterPrice(toVal);
    return;
  }

  const steps = meterSteps(fromVal, toVal, CONFIG.meter?.maxSteps ?? 40);
  if (!steps || steps.length === 0) {
    currentDisplayedPrice = toVal;
    elements.forEach((d) => { d.textContent = formatINR(toVal); });
    announceMeterPrice(toVal);
    return;
  }

  let idx = 0;
  tickTimer = setInterval(() => {
    if (idx < steps.length) {
      currentDisplayedPrice = steps[idx];
      elements.forEach((d) => {
        d.textContent = formatINR(currentDisplayedPrice);
        d.classList.remove("digit-tick");
        void d.offsetWidth;
        d.classList.add("digit-tick");
      });
      idx += 1;
    } else {
      clearInterval(tickTimer);
      tickTimer = null;
      currentDisplayedPrice = toVal;
      elements.forEach((d) => {
        d.textContent = formatINR(toVal);
        d.classList.add("is-landing");
        setTimeout(() => d.classList.remove("is-landing"), 300);
      });
      announceMeterPrice(toVal);
    }
  }, CONFIG.meter?.tickMs ?? 28);
}

function announceMeterPrice(price) {
  let announcer = document.getElementById("meter-live-announcer");
  if (!announcer) {
    announcer = el("div", "sr-only");
    announcer.id = "meter-live-announcer";
    announcer.setAttribute("aria-live", "polite");
    document.body.appendChild(announcer);
  }
  announcer.textContent = t("a11y.meterLive", { price: formatINR(price) });
}

export function spawnFlyChip(originEl, diffPrice) {
  if (!originEl || diffPrice === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const oRect = originEl.getBoundingClientRect();
  const target = window.innerWidth >= 1024 ? document.getElementById("meter-digits") : document.getElementById("phone-meter-digits");
  if (!target) return;
  const tRect = target.getBoundingClientRect();

  const chip = el("div", "meter-fly-chip");
  const absVal = formatINR(Math.abs(diffPrice));
  chip.textContent = diffPrice > 0 ? t("meter.added", { amount: absVal }) : t("meter.removed", { amount: absVal });
  chip.style.left = `${oRect.left + (oRect.width / 2)}px`;
  chip.style.top = `${oRect.top + (oRect.height / 2)}px`;
  document.body.appendChild(chip);

  const dx = (tRect.left + (tRect.width / 2)) - (oRect.left + (oRect.width / 2));
  const dy = (tRect.top + (tRect.height / 2)) - (oRect.top + (oRect.height / 2));
  chip.animate([
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * 0.7}px, ${dy * 0.7 - 20}px) scale(1.05)`, opacity: 0.9, offset: 0.7 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0 }
  ], { duration: 550, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }).onfinish = () => chip.remove();
}
