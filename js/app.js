// The Website Price Tag - Main application entry point & coordinator
import { CONFIG } from "../config.js";
import { quote, setType, toggleFeature, setCount, setTier, emptyPick, samplePicks, FEATURES, formatINR } from "./engine/pricing.js";
import { t } from "./copy.js";
import { getTheme, setTheme, loadInitialState, savePick, clearPick } from "./store.js";
import { initLoader } from "./loader.js";
import { getHomeUrl, getProgramUrl } from "./links.js";
import { initTypesUI, renderTypesUI } from "./types-ui.js";
import { initFeaturesUI, renderFeaturesUI, showReasonToast } from "./features-ui.js";
import { initMeterUI, renderMeterUI, spawnFlyChip } from "./meter-ui.js";
import { renderReceiptUI, setReceiptVisible, isReceiptVisible } from "./receipt-ui.js";
import { initShareUI, renderShareUI } from "./share-ui.js";
import { initDSAUI, renderDSAUI } from "./dsa-ui.js";
import { initSourcesUI } from "./sources-ui.js";
import { initScrollReveal } from "./reveal.js";

const state = { pick: null, fromHash: false, quote: null, sampleRunning: false, sampleTimer: null };

function renderAll(options = {}) {
  state.quote = quote(state.pick);
  renderTypesUI(document.getElementById("types-grid"), state.pick);
  renderFeaturesUI(document.getElementById("features-container"), state.pick, FEATURES);
  renderMeterUI(state.pick, state.quote, options);

  renderReceiptUI(document.getElementById("receipt-container"), state.pick, state.quote, {
    onShare: () => document.getElementById("share")?.scrollIntoView({ behavior: "smooth" }),
    onEdit: () => document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth" }),
    onRestart: handleRestart
  });

  renderShareUI(document.getElementById("share-container"), state.pick, state.quote);
  renderDSAUI(document.getElementById("dsa-grid"), state.pick, state.quote);
  updateStepper();
}

function updateStepper() {
  const hasType = Boolean(state.pick?.type);
  const hasReceipt = isReceiptVisible();
  const fill = document.getElementById("stepper-line-fill");
  document.getElementById("step-pill-1")?.classList.toggle("done", hasType);
  document.getElementById("step-pill-1")?.classList.toggle("active", !hasType);
  document.getElementById("step-pill-2")?.classList.toggle("done", hasReceipt);
  document.getElementById("step-pill-2")?.classList.toggle("active", hasType && !hasReceipt);
  document.getElementById("step-pill-3")?.classList.toggle("active", hasReceipt);
  if (fill) fill.style.width = hasReceipt ? "100%" : hasType ? "50%" : "0%";
}

function handleSelectType(typeId) {
  abortSample();
  const res = setType(state.pick, typeId);
  if (res.reason) return;
  state.pick = res.pick;
  savePick(state.pick);
  renderAll({ immediate: false });
  document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth" });
}

function handleToggleFeature(featureId, rowEl) {
  abortSample();
  if (!state.pick?.type) {
    showReasonToast(document.getElementById("features-container"), t("featureStep.noType"));
    return;
  }
  const oldPrice = state.quote?.ok ? state.quote.price : 0;
  const res = toggleFeature(state.pick, featureId);
  if (res.reason) {
    showReasonToast(document.getElementById("features-container"), t(`reasons.${res.reason}`));
    return;
  }
  state.pick = res.pick;
  savePick(state.pick);
  flashRow(rowEl);
  renderAll({ immediate: false });
  spawnFlyChip(rowEl, (state.quote?.ok ? state.quote.price : 0) - oldPrice);
}

function handleCountFeature(featureId, delta, rowEl) {
  abortSample();
  if (!state.pick?.type) {
    showReasonToast(document.getElementById("features-container"), t("featureStep.noType"));
    return;
  }
  const oldPrice = state.quote?.ok ? state.quote.price : 0;
  const res = setCount(state.pick, featureId, (state.pick.counts?.[featureId] || 0) + delta);
  if (res.reason) return;
  state.pick = res.pick;
  savePick(state.pick);
  flashRow(rowEl);
  renderAll({ immediate: false });
  spawnFlyChip(rowEl, (state.quote?.ok ? state.quote.price : 0) - oldPrice);
}

function flashRow(rowEl) {
  if (!rowEl) return;
  rowEl.classList.remove("is-flashing");
  void rowEl.offsetWidth;
  rowEl.classList.add("is-flashing");
}

function handleTier(tier) {
  abortSample();
  const res = setTier(state.pick, tier);
  if (res.reason) return;
  state.pick = res.pick;
  savePick(state.pick);
  renderAll({ immediate: false });
}

function handleShowReceipt() {
  abortSample();
  setReceiptVisible(true);
  renderAll({ immediate: false });
  document.getElementById("step-3")?.scrollIntoView({ behavior: "smooth" });
}

function handleRestart() {
  state.pick = emptyPick();
  clearPick();
  setReceiptVisible(false);
  renderAll({ immediate: true });
  document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth" });
}

function abortSample() {
  if (state.sampleRunning) {
    state.sampleRunning = false;
    if (state.sampleTimer) clearTimeout(state.sampleTimer);
    document.getElementById("hero-sample-btn")?.removeAttribute("aria-disabled");
  }
}

function runSample() {
  if (state.sampleRunning) return;
  state.sampleRunning = true;
  document.getElementById("hero-sample-btn")?.setAttribute("aria-disabled", "true");
  document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth" });

  const picks = samplePicks();
  let idx = 1;
  function step() {
    if (!state.sampleRunning) return;
    if (idx < picks.length) {
      state.pick = picks[idx];
      savePick(state.pick);
      renderAll({ immediate: false });
      idx += 1;
      state.sampleTimer = setTimeout(step, CONFIG.sample?.stepMs ?? 650);
    } else {
      state.sampleRunning = false;
      document.getElementById("hero-sample-btn")?.removeAttribute("aria-disabled");
      setReceiptVisible(true);
      renderAll({ immediate: false });
      (document.querySelector(".receipt-end-box") || document.getElementById("step-3"))?.scrollIntoView({ behavior: "smooth" });
    }
  }
  state.sampleTimer = setTimeout(step, 350);
}

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;
  const current = getTheme();
  document.documentElement.setAttribute("data-theme", current);
  toggleBtn.setAttribute("aria-label", current === "dark" ? t("header.themeToLight") : t("header.themeToDark"));

  toggleBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    toggleBtn.setAttribute("aria-label", next === "dark" ? t("header.themeToLight") : t("header.themeToDark"));
  });
}

function init() {
  const initial = loadInitialState();
  state.pick = initial.pick;
  state.fromHash = initial.fromHash;
  if (state.fromHash && state.pick?.type) setReceiptVisible(true);

  initTheme();
  const home = document.getElementById("header-home-link");
  if (home) home.href = getHomeUrl();
  const prog = document.getElementById("header-programs-btn");
  if (prog) { prog.href = getProgramUrl(); prog.target = "_blank"; prog.rel = "noopener noreferrer"; }
  const foot = document.getElementById("footer-home-link");
  if (foot) foot.href = getHomeUrl();
  const ghost = document.getElementById("meter-ghost-digits");
  if (ghost) ghost.textContent = formatINR(888888);

  initTypesUI(document.getElementById("types-grid"), handleSelectType);
  initFeaturesUI(document.getElementById("features-container"), {
    onToggle: handleToggleFeature,
    onCount: handleCountFeature,
    onNext: handleShowReceipt,
    onBack: () => document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth" })
  });
  initMeterUI({ onTier: handleTier, onGetPriceTag: handleShowReceipt });
  initShareUI(document.getElementById("share-container"));
  initDSAUI(document.getElementById("dsa-grid"));
  initSourcesUI(document.getElementById("sources-container"));

  const sampleBtn = document.getElementById("hero-sample-btn");
  if (sampleBtn) {
    if (!CONFIG.features?.sample) sampleBtn.classList.add("is-hidden");
    else sampleBtn.addEventListener("click", runSample);
  }

  renderAll({ immediate: Boolean(state.pick?.type) });

  const isTest = window.location.search.includes("test=1");
  if (isTest) {
    const overlay = document.getElementById("loader-overlay");
    if (overlay) overlay.classList.add("is-hidden");
    document.body.classList.add("page-loaded");
    import("./selftest.js").then((mod) => mod.runSelfTests());
  } else {
    initLoader(() => {
      document.body.classList.add("page-loaded");
      initScrollReveal();
    });
  }

  window.addEventListener("pointerdown", (e) => {
    if (state.sampleRunning && !e.target.closest("#hero-sample-btn")) abortSample();
  }, { passive: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
