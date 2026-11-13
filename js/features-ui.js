// 6F. Step 2: Features UI
import { GROUPS, featuresInGroup, shortINR, isIncluded, isOn } from "./engine/pricing.js";
import { t } from "./copy.js";
import { createIcon } from "./types-ui.js";

let reasonTimer = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function showReasonToast(container, message) {
  let toast = container.querySelector(".feature-reason-toast");
  if (!toast) {
    toast = el("div", "feature-reason-toast");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    container.prepend(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");

  if (reasonTimer) clearTimeout(reasonTimer);
  reasonTimer = setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

export function initFeaturesUI(container, callbacks = {}) {
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const wrapper = el("div", "features-wrapper");

  GROUPS.forEach((group) => {
    const groupCard = el("div", "card group-card");
    groupCard.dataset.group = group;
    groupCard.appendChild(el("h3", "group-title", t(`groups.${group}`)));

    const list = el("div", "features-list");
    featuresInGroup(group).forEach((f) => {
      const row = el("div", "feature-row");
      row.dataset.id = f.id;
      row.dataset.kind = f.kind;

      const info = el("div", "feature-info");
      const titleRow = el("div", "feature-title-row");
      titleRow.appendChild(el("span", "feature-name", t(`features.${f.id}.name`)));
      titleRow.appendChild(el("span", "chip feature-chip"));
      info.appendChild(titleRow);
      info.appendChild(el("p", "feature-desc", t(`features.${f.id}.desc`)));
      row.appendChild(info);

      const controlWrap = el("div", "feature-control");
      if (f.kind === "count") {
        const stepper = el("div", "stepper-ctrl");
        const minus = el("button", "btn-icon stepper-btn stepper-minus");
        minus.type = "button";
        minus.setAttribute("aria-label", t("featureStep.less"));
        minus.appendChild(createIcon("minus", "icon-stepper"));
        minus.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.onCount && callbacks.onCount(f.id, -1, row);
        });

        const countVal = el("span", "stepper-count-label", "0");
        const plus = el("button", "btn-icon stepper-btn stepper-plus");
        plus.type = "button";
        plus.setAttribute("aria-label", t("featureStep.more"));
        plus.appendChild(createIcon("plus", "icon-stepper"));
        plus.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.onCount && callbacks.onCount(f.id, 1, row);
        });

        stepper.appendChild(minus);
        stepper.appendChild(countVal);
        stepper.appendChild(plus);
        controlWrap.appendChild(stepper);
      } else {
        const switchBtn = el("button", "switch-btn");
        switchBtn.type = "button";
        switchBtn.setAttribute("role", "switch");
        switchBtn.setAttribute("aria-checked", "false");
        switchBtn.setAttribute("aria-label", t(`features.${f.id}.name`));
        switchBtn.appendChild(el("span", "switch-thumb"));
        switchBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.onToggle && callbacks.onToggle(f.id, row);
        });
        controlWrap.appendChild(switchBtn);
      }

      row.appendChild(controlWrap);
      row.addEventListener("click", () => {
        if (f.kind !== "count" && callbacks.onToggle) callbacks.onToggle(f.id, row);
      });
      list.appendChild(row);
    });

    groupCard.appendChild(list);
    wrapper.appendChild(groupCard);
  });

  const actionRow = el("div", "features-actions-row");
  const nextBtn = el("button", "btn btn-primary", t("featureStep.next"));
  nextBtn.type = "button";
  nextBtn.addEventListener("click", () => callbacks.onNext && callbacks.onNext());

  const backBtn = el("button", "btn btn-secondary", t("featureStep.back"));
  backBtn.type = "button";
  backBtn.addEventListener("click", () => callbacks.onBack && callbacks.onBack());

  actionRow.appendChild(nextBtn);
  actionRow.appendChild(backBtn);
  wrapper.appendChild(actionRow);
  container.appendChild(wrapper);
}

export function renderFeaturesUI(container, pick, features) {
  if (!container) return;
  const hasType = Boolean(pick && pick.type);
  const wrapper = container.querySelector(".features-wrapper");
  if (wrapper) wrapper.classList.toggle("is-dimmed", !hasType);

  container.querySelectorAll(".feature-row").forEach((row) => {
    const id = row.dataset.id;
    const kind = row.dataset.kind;
    const f = features.find((item) => item.id === id);
    if (!f) return;

    const chip = row.querySelector(".feature-chip");
    const isInc = hasType && isIncluded(pick.type, id);

    row.classList.toggle("is-included", isInc);
    if (chip) {
      while (chip.firstChild) chip.removeChild(chip.firstChild);
      if (isInc) {
        chip.className = "chip chip-included";
        chip.appendChild(createIcon("lock", "icon-lock-inline"));
        chip.appendChild(document.createTextNode(` ${t("featureStep.included")}`));
        chip.setAttribute("title", t("featureStep.includedHint"));
      } else {
        chip.className = "chip chip-price";
        chip.removeAttribute("title");
        if (kind === "add") {
          chip.textContent = t("featureStep.add", { low: shortINR(f.low), high: shortINR(f.high) });
        } else if (kind === "percent") {
          chip.textContent = t("featureStep.percent", { low: f.low, high: f.high });
        } else if (kind === "count") {
          chip.textContent = t("featureStep.perUnit", { low: shortINR(f.low), high: shortINR(f.high) });
        }
      }
    }

    if (kind === "count") {
      const count = (pick && pick.counts && pick.counts[id]) || 0;
      const countLabel = row.querySelector(".stepper-count-label");
      const minus = row.querySelector(".stepper-minus");
      const plus = row.querySelector(".stepper-plus");
      if (countLabel) countLabel.textContent = `${count} ${count === 1 ? f.one : f.many}`;
      if (minus) minus.disabled = !hasType || count <= 0;
      if (plus) plus.disabled = !hasType || count >= f.max;
    } else {
      const switchBtn = row.querySelector(".switch-btn");
      if (switchBtn) {
        const on = hasType && (isInc || isOn(pick, id));
        switchBtn.setAttribute("aria-checked", on ? "true" : "false");
        switchBtn.classList.toggle("is-checked", on);
        if (isInc) switchBtn.setAttribute("aria-disabled", "true");
        else switchBtn.removeAttribute("aria-disabled");
      }
    }
  });
}
