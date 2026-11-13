// The Website Price Tag - Main application entry point
import { CONFIG } from "../config.js";
import { COPY, t } from "./copy.js";
import { formatINR } from "./engine/pricing.js";
import { getTheme, setTheme, loadInitialState, savePick } from "./store.js";
import { initLoader } from "./loader.js";
import { getHomeUrl, getProgramUrl } from "./links.js";

// Global state container
const state = {
  pick: null,
  fromHash: false,
  quote: null
};

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  const currentTheme = getTheme();
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeButtonAria(toggleBtn, currentTheme);

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
    updateThemeButtonAria(toggleBtn, nextTheme);
  });
}

function updateThemeButtonAria(button, theme) {
  const label = theme === "dark" ? t("header.themeToLight") : t("header.themeToDark");
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

function setupHeaderLinks() {
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
  if (ghostEl) {
    ghostEl.textContent = formatINR(888888);
  }
}

function init() {
  // Load initial pick (hash, saved, or empty)
  const initial = loadInitialState();
  state.pick = initial.pick;
  state.fromHash = initial.fromHash;

  initTheme();
  setupHeaderLinks();
  setupGhostDigits();

  initLoader(() => {
    document.body.classList.add("page-loaded");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
