// 6A. First visit session loader
import { CONFIG } from "../config.js";
import { COPY, t } from "./copy.js";
import { quote, samplePicks, meterSteps, formatINR } from "./engine/pricing.js";
import { getIntroSeen, setIntroSeen } from "./store.js";

export function initLoader(onComplete) {
  const overlay = document.getElementById("loader-overlay");
  const card = document.getElementById("loader-card");
  const digitsEl = document.getElementById("loader-digits");
  const fillEl = document.getElementById("loader-progress-fill");

  if (!overlay) {
    if (onComplete) onComplete();
    return;
  }

  // Repeat visits in the session skip it
  if (getIntroSeen()) {
    overlay.classList.add("is-hidden");
    if (onComplete) onComplete();
    return;
  }

  const startTime = Date.now();
  const sample = samplePicks();
  const targetPrice = quote(sample[sample.length - 1]).price;
  const steps = meterSteps(0, targetPrice, 24);

  let currentStep = 0;
  const minMs = CONFIG.loader?.minMs ?? 900;
  const maxMs = CONFIG.loader?.maxMs ?? 2500;
  const stepInterval = Math.max(25, Math.floor((minMs * 0.75) / (steps.length || 1)));

  const timer = setInterval(() => {
    if (currentStep < steps.length) {
      const val = steps[currentStep];
      if (digitsEl) {
        digitsEl.textContent = formatINR(val);
      }
      if (fillEl) {
        const pct = Math.round(((currentStep + 1) / steps.length) * 100);
        fillEl.style.width = `${pct}%`;
      }
      currentStep += 1;
    } else {
      clearInterval(timer);
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, minMs - elapsed);

      setTimeout(() => {
        finishLoader();
      }, remainingWait);
    }
  }, stepInterval);

  // Hard safety timeout
  setTimeout(() => {
    finishLoader();
  }, maxMs);

  function finishLoader() {
    clearInterval(timer);
    setIntroSeen();
    if (card) card.classList.add("exiting");
    setTimeout(() => {
      overlay.classList.add("is-hidden");
      if (onComplete) onComplete();
    }, 250);
  }
}
