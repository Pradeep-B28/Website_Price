// The Website Price Tag - Main application entry point & coordinator
import { quote, setType, toggleFeature, setCount, setTier, FEATURES, formatINR } from "./engine/pricing.js";
import { t } from "./copy.js";
import { getTheme, setTheme, loadInitialState, savePick } from "./store.js";
import { initLoader } from "./loader.js";
import { getHomeUrl, getProgramUrl } from "./links.js";
import { initTypesUI, renderTypesUI } from "./types-ui.js";
import { initFeaturesUI, renderFeaturesUI, showReasonToast } from "./features-ui.js";
import { initMeterUI, renderMeterUI, spawnFlyChip } from "./meter-ui.js";

const state = {
  pick: null,
  fromHash: false,
  quote: null
};

function renderAll(options = {}) {
  state.quote = quote(state.pick);

  const typesContainer = document.getElementById("types-grid");
  const featuresContainer = document.getElementById("features-container");

  renderTypesUI(typesContainer, state.pick);
  renderFeaturesUI(featuresContainer, state.pick, FEATURES);
  renderMeterUI(state.pick, state.quote, options);
}

function handleSelectType(typeId) {
  const res = setType(state.pick, typeId);
  if (res.reason) {
    const featBox = document.getElementById("features-container");
    if (featBox) showReasonToast(featBox, t(`reasons.${res.reason}`));
    return;
  }
  state.pick = res.pick;
  savePick(state.pick);
  renderAll({ immediate: false });

  // Smooth scroll to Step 2
  const s2 = document.getElementById("step-2");
  if (s2) s2.scrollIntoView({ behavior: "smooth" });
}

function handleToggleFeature(featureId, rowEl) {
  if (!state.pick || !state.pick.type) {
    const featBox = document.getElementById("features-container");
    if (featBox) showReasonToast(featBox, t("featureStep.noType"));
    return;
  }

  const oldPrice = state.quote && state.quote.ok ? state.quote.price : 0;
  const res = toggleFeature(state.pick, featureId);
  if (res.reason) {
    const featBox = document.getElementById("features-container");
    if (featBox) showReasonToast(featBox, t(`reasons.${res.reason}`));
    return;
  }

  state.pick = res.pick;
  savePick(state.pick);
  if (rowEl) {
    rowEl.classList.remove("is-flashing");
    void rowEl.offsetWidth;
    rowEl.classList.add("is-flashing");
  }
  renderAll({ immediate: false });

  const newPrice = state.quote && state.quote.ok ? state.quote.price : 0;
  spawnFlyChip(rowEl, newPrice - oldPrice);
}

function handleCountFeature(featureId, delta, rowEl) {
  if (!state.pick || !state.pick.type) {
    const featBox = document.getElementById("features-container");
    if (featBox) showReasonToast(featBox, t("featureStep.noType"));
    return;
  }

  const oldPrice = state.quote && state.quote.ok ? state.quote.price : 0;
  const currentCount = (state.pick.counts && state.pick.counts[featureId]) || 0;
  const targetCount = currentCount + delta;

  const res = setCount(state.pick, featureId, targetCount);
  if (res.reason) {
    const featBox = document.getElementById("features-container");
    if (featBox) showReasonToast(featBox, t(`reasons.${res.reason}`));
    return;
  }

  state.pick = res.pick;
  savePick(state.pick);
  if (rowEl) {
    rowEl.classList.remove("is-flashing");
    void rowEl.offsetWidth;
    rowEl.classList.add("is-flashing");
  }
  renderAll({ immediate: false });

  const newPrice = state.quote && state.quote.ok ? state.quote.price : 0;
  spawnFlyChip(rowEl, newPrice - oldPrice);
}

function handleTier(tier) {
  const res = setTier(state.pick, tier);
  if (res.reason) return;

  state.pick = res.pick;
  savePick(state.pick);
  renderAll({ immediate: false });
}

function handleNext() {
  const s3 = document.getElementById("step-3");
  if (s3) s3.scrollIntoView({ behavior: "smooth" });
}

function handleBack() {
  const s1 = document.getElementById("step-1");
  if (s1) s1.scrollIntoView({ behavior: "smooth" });
}

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  const currentTheme = getTheme();
  document.documentElement.setAttribute("data-theme", currentTheme);
  const label = currentTheme === "dark" ? t("header.themeToLight") : t("header.themeToDark");
  toggleBtn.setAttribute("aria-label", label);

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
    const nextLabel = nextTheme === "dark" ? t("header.themeToLight") : t("header.themeToDark");
    toggleBtn.setAttribute("aria-label", nextLabel);
  });
}

function setupLinks() {
  const homeLink = document.getElementById("header-home-link");
  if (homeLink) homeLink.href = getHomeUrl();

  const programsBtn = document.getElementById("header-programs-btn");
  if (programsBtn) {
    programsBtn.href = getProgramUrl();
    programsBtn.target = "_blank";
    programsBtn.rel = "noopener noreferrer";
  }

  const footerHomeLink = document.getElementById("footer-home-link");
  if (footerHomeLink) footerHomeLink.href = getHomeUrl();
}

function setupGhostDigits() {
  const ghostEl = document.getElementById("meter-ghost-digits");
  if (ghostEl) ghostEl.textContent = formatINR(888888);
}

function init() {
  const initial = loadInitialState();
  state.pick = initial.pick;
  state.fromHash = initial.fromHash;

  initTheme();
  setupLinks();
  setupGhostDigits();

  // Initialize UI parts
  const typesContainer = document.getElementById("types-grid");
  const featuresContainer = document.getElementById("features-container");

  initTypesUI(typesContainer, handleSelectType);
  initFeaturesUI(featuresContainer, {
    onToggle: handleToggleFeature,
    onCount: handleCountFeature,
    onNext: handleNext,
    onBack: handleBack
  });
  initMeterUI({
    onTier: handleTier,
    onGetPriceTag: handleNext
  });

  // If restoring saved pick or hash with type, render immediately with no ticking
  renderAll({ immediate: Boolean(state.pick && state.pick.type) });

  initLoader(() => {
    document.body.classList.add("page-loaded");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
