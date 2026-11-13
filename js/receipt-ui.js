// 6H & 6I. Step 3: Your Price Tag (Receipt, print animation, end line, skills, CTA)
import { CONFIG } from "../config.js";
import { formatINR, getFeature, meterSteps } from "./engine/pricing.js";
import { t } from "./copy.js";
import { createIcon } from "./types-ui.js";
import { getProgramUrl, getSalesWhatsAppUrl } from "./links.js";

let hasPrintedOnce = false;
let receiptVisible = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function isReceiptVisible() {
  return receiptVisible;
}

export function setReceiptVisible(val) {
  receiptVisible = val;
}

export function renderReceiptUI(container, pick, q, callbacks = {}) {
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  if (!pick?.type || !q?.ok || !receiptVisible) {
    container.appendChild(el("div", "empty-card", t("receipt.estimate")));
    return;
  }

  const wrapper = el("div", "receipt-section-wrapper");

  // Receipt Slot (Mini meter top)
  const slot = el("div", "receipt-slot");
  slot.appendChild(el("div", "receipt-slot-line"));
  wrapper.appendChild(slot);

  // The Paper Receipt
  const paper = el("div", "receipt-paper");
  if (!hasPrintedOnce && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    paper.classList.add("is-printing");
    hasPrintedOnce = true;
  }

  // Header
  const head = el("div", "receipt-header");
  head.appendChild(el("h3", "receipt-title", t("receipt.title")));
  head.appendChild(el("div", "receipt-type-name", t(`types.${q.type}.name`)));
  head.appendChild(el("div", "receipt-date", new Date().toLocaleDateString("en-IN")));
  paper.appendChild(head);

  // Lines in byCost order
  const linesBox = el("div", "receipt-lines");
  q.byCost.forEach((line, idx) => {
    const row = el("div", "receipt-line-row");
    row.style.animationDelay = `${idx * 40}ms`;

    let labelText = "";
    if (line.kind === "base") {
      labelText = t("receipt.lineBase", { type: t(`types.${line.id}.name`) });
    } else if (line.kind === "count") {
      const f = getFeature(line.id);
      const unit = line.count === 1 ? f.one : f.many;
      labelText = t("receipt.lineCount", { count: line.count, unit });
    } else if (line.kind === "percent") {
      labelText = t("receipt.linePercent", {
        name: t(`features.${line.id}.name`),
        low: line.pct[0],
        high: line.pct[1]
      });
    } else {
      labelText = t(`features.${line.id}.name`);
    }

    row.appendChild(el("span", "receipt-line-name", labelText));
    row.appendChild(el("span", "receipt-line-dots"));
    row.appendChild(el("span", "receipt-line-price", t("receipt.lineRange", {
      low: formatINR(line.low),
      high: formatINR(line.high)
    })));
    linesBox.appendChild(row);
  });
  paper.appendChild(linesBox);

  // Included features
  if (q.included && q.included.length > 0) {
    const incBox = el("div", "receipt-included-box");
    incBox.appendChild(el("div", "receipt-included-title", t("receipt.includedTitle")));
    const incChips = el("div", "receipt-included-chips");
    q.included.forEach((incId) => {
      const chip = el("span", "chip chip-included");
      chip.appendChild(createIcon("lock", "icon-lock-inline"));
      chip.appendChild(document.createTextNode(` ${t(`features.${incId}.name`)}`));
      incChips.appendChild(chip);
    });
    incBox.appendChild(incChips);
    paper.appendChild(incBox);
  }

  // Summary section
  paper.appendChild(el("hr", "receipt-divider"));
  const summary = el("div", "receipt-summary");

  const totalRow = el("div", "receipt-summary-row receipt-total-row");
  totalRow.appendChild(el("span", "receipt-summary-label", t("receipt.total")));
  totalRow.appendChild(el("span", "receipt-summary-val", t("receipt.lineRange", {
    low: formatINR(q.total.low),
    high: formatINR(q.total.high)
  })));
  summary.appendChild(totalRow);

  // Large tier price
  const tierRow = el("div", "receipt-tier-box");
  const tierName = t(`tiers.${pick.tier}.name`);
  tierRow.appendChild(el("div", "receipt-tier-label", t("receipt.tierPrice", { tier: tierName })));
  const tierVal = el("div", "receipt-tier-price");
  tierVal.appendChild(el("span", "receipt-currency", "₹"));
  const tierDigits = el("span", "receipt-digits", formatINR(q.price));
  tierVal.appendChild(tierDigits);
  tierRow.appendChild(tierVal);
  summary.appendChild(tierRow);

  // Weeks & Yearly
  const weeksRow = el("div", "receipt-summary-row");
  weeksRow.appendChild(el("span", "receipt-summary-label", t("receipt.weeks")));
  weeksRow.appendChild(el("span", "receipt-summary-val", t("receipt.weeksValue", {
    low: q.weeks.low,
    high: q.weeks.high
  })));
  summary.appendChild(weeksRow);

  const yearlyRow = el("div", "receipt-summary-row");
  yearlyRow.appendChild(el("span", "receipt-summary-label", t("receipt.yearly")));
  yearlyRow.appendChild(el("span", "receipt-summary-val", t("receipt.yearlyValue", {
    low: formatINR(q.yearly.low),
    high: formatINR(q.yearly.high)
  })));
  summary.appendChild(yearlyRow);

  summary.appendChild(el("p", "receipt-yearly-note", t("receipt.yearlyNote")));
  summary.appendChild(el("p", "receipt-estimate-note", t("receipt.estimate")));
  paper.appendChild(summary);

  // Torn zig-zag edge
  paper.appendChild(el("div", "receipt-zigzag-edge"));
  wrapper.appendChild(paper);

  // 6H. The End Line
  const endBox = el("div", "receipt-end-box");
  endBox.appendChild(el("div", "end-price-line", t("receipt.endPrice", { price: formatINR(q.price) })));
  endBox.appendChild(el("div", "end-learn-line", t("receipt.endLearn")));

  const endActions = el("div", "end-actions-row");
  const learnBtn = el("a", "btn btn-primary", t("receipt.learn"));
  learnBtn.href = getProgramUrl();
  learnBtn.target = "_blank";
  learnBtn.rel = "noopener noreferrer";

  const shareBtn = el("button", "btn btn-secondary", t("share.title"));
  shareBtn.type = "button";
  shareBtn.addEventListener("click", () => callbacks.onShare && callbacks.onShare());

  endActions.appendChild(learnBtn);
  endActions.appendChild(shareBtn);
  endBox.appendChild(endActions);

  // Secondary buttons: Change picks & Start again (inline confirm)
  const minorActions = el("div", "end-minor-row");
  const editBtn = el("button", "btn-link", t("receipt.edit"));
  editBtn.type = "button";
  editBtn.addEventListener("click", () => callbacks.onEdit && callbacks.onEdit());

  const restartBtn = el("button", "btn-link text-danger", t("receipt.restart"));
  restartBtn.type = "button";

  const confirmRow = el("div", "restart-confirm-row is-hidden");
  confirmRow.appendChild(el("span", "confirm-msg", t("receipt.restartAsk")));
  const yesBtn = el("button", "btn btn-danger-pill", t("receipt.restartYes"));
  yesBtn.type = "button";
  yesBtn.addEventListener("click", () => callbacks.onRestart && callbacks.onRestart());
  const noBtn = el("button", "btn btn-secondary-pill", t("receipt.restartNo"));
  noBtn.type = "button";
  noBtn.addEventListener("click", () => {
    confirmRow.classList.add("is-hidden");
    restartBtn.classList.remove("is-hidden");
  });
  confirmRow.appendChild(yesBtn);
  confirmRow.appendChild(noBtn);

  restartBtn.addEventListener("click", () => {
    restartBtn.classList.add("is-hidden");
    confirmRow.classList.remove("is-hidden");
  });

  minorActions.appendChild(editBtn);
  minorActions.appendChild(restartBtn);
  minorActions.appendChild(confirmRow);
  endBox.appendChild(minorActions);
  wrapper.appendChild(endBox);

  // 6I. Skills Card
  const skillsCard = el("div", "card skills-card");
  const skillsHead = el("div", "skills-header");
  skillsHead.appendChild(el("h3", "skills-title", t("skills.title")));
  skillsHead.appendChild(el("span", "chip chip-price", t("skills.count", { count: q.skills.length })));
  skillsCard.appendChild(skillsHead);
  skillsCard.appendChild(el("p", "skills-body", t("skills.body")));

  const chipsGrid = el("div", "skills-chips-grid");
  q.skills.forEach((skillId, idx) => {
    const chip = el("span", "skill-pill", t(`skills.names.${skillId}`));
    chip.style.animationDelay = `${idx * 30}ms`;
    chipsGrid.appendChild(chip);
  });
  skillsCard.appendChild(chipsGrid);
  wrapper.appendChild(skillsCard);

  // 6I. CTA Card
  const ctaCard = el("div", "card cta-card");
  ctaCard.appendChild(el("h3", "cta-title", t("cta.title")));
  ctaCard.appendChild(el("p", "cta-body", t("cta.body", { program: CONFIG.program.name })));

  const ctaActions = el("div", "cta-actions-row");
  const ctaPrimary = el("a", "btn btn-primary", t("cta.button"));
  ctaPrimary.href = getProgramUrl();
  ctaPrimary.target = "_blank";
  ctaPrimary.rel = "noopener noreferrer";
  ctaActions.appendChild(ctaPrimary);

  if (CONFIG.salesWhatsApp) {
    const waBtn = el("a", "btn btn-secondary", t("cta.whatsApp"));
    waBtn.href = getSalesWhatsAppUrl(t("cta.whatsAppText", {
      type: t(`types.${q.type}.name`),
      program: CONFIG.program.name
    }));
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    ctaActions.appendChild(waBtn);
  }
  ctaCard.appendChild(ctaActions);
  wrapper.appendChild(ctaCard);

  container.appendChild(wrapper);
}
