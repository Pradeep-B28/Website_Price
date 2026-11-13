// 6J. Share UI (WhatsApp share, copy link, fallback input)
import { CONFIG } from "../config.js";
import { formatINR, encodePick } from "./engine/pricing.js";
import { t } from "./copy.js";
import { createIcon } from "./types-ui.js";
import { getWhatsAppShareUrl } from "./links.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initShareUI(container) {
  if (!container || !CONFIG.features?.shareLink) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  const card = el("div", "card share-card");
  card.appendChild(el("h3", "share-title", t("share.title")));

  const actions = el("div", "share-actions-row");

  const waBtn = el("a", "btn btn-secondary share-wa-btn");
  waBtn.id = "share-wa-link";
  waBtn.target = "_blank";
  waBtn.rel = "noopener noreferrer";
  waBtn.appendChild(createIcon("chat", "icon-chat"));
  waBtn.appendChild(document.createTextNode(` ${t("share.whatsApp")}`));
  actions.appendChild(waBtn);

  const copyBtn = el("button", "btn btn-secondary share-copy-btn");
  copyBtn.type = "button";
  copyBtn.id = "share-copy-btn";
  copyBtn.appendChild(createIcon("link", "icon-copy-link"));
  const copyText = el("span", "copy-btn-text", ` ${t("share.copy")}`);
  copyBtn.appendChild(copyText);
  actions.appendChild(copyBtn);

  card.appendChild(actions);

  // Fallback copy input (hidden by default)
  const fallbackBox = el("div", "share-fallback-box is-hidden");
  fallbackBox.id = "share-fallback-box";
  const input = el("input", "share-url-input");
  input.type = "text";
  input.readOnly = true;
  input.id = "share-fallback-input";
  const errText = el("p", "share-fallback-err", t("share.copyFailed"));
  fallbackBox.appendChild(input);
  fallbackBox.appendChild(errText);
  card.appendChild(fallbackBox);

  container.appendChild(card);

  copyBtn.addEventListener("click", async () => {
    const shareUrl = copyBtn.dataset.url;
    if (!shareUrl) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        while (copyBtn.firstChild) copyBtn.removeChild(copyBtn.firstChild);
        copyBtn.appendChild(createIcon("check", "icon-check-inline"));
        copyBtn.appendChild(el("span", "copy-btn-text", ` ${t("share.copied")}`));
        copyBtn.classList.add("btn-copied");

        setTimeout(() => {
          while (copyBtn.firstChild) copyBtn.removeChild(copyBtn.firstChild);
          copyBtn.appendChild(createIcon("link", "icon-copy-link"));
          copyBtn.appendChild(el("span", "copy-btn-text", ` ${t("share.copy")}`));
          copyBtn.classList.remove("btn-copied");
        }, 2000);
        return;
      }
      throw new Error("Clipboard API not available");
    } catch (err) {
      fallbackBox.classList.remove("is-hidden");
      input.value = shareUrl;
      input.focus();
      input.select();
    }
  });
}

export function renderShareUI(container, pick, q) {
  if (!container || !CONFIG.features?.shareLink) return;
  const isReady = Boolean(pick?.type && q?.ok);
  const card = container.querySelector(".share-card");
  if (!card) return;

  if (!isReady) {
    card.classList.add("is-disabled");
    return;
  }
  card.classList.remove("is-disabled");

  const baseUrl = CONFIG.siteUrl || (window.location.origin + window.location.pathname);
  const shareUrl = `${baseUrl}/#${encodePick(pick)}`;

  const waLink = document.getElementById("share-wa-link");
  if (waLink) {
    const text = t("share.text", {
      price: formatINR(q.price),
      url: shareUrl
    });
    waLink.href = getWhatsAppShareUrl(text);
  }

  const copyBtn = document.getElementById("share-copy-btn");
  if (copyBtn) {
    copyBtn.dataset.url = shareUrl;
  }
}
