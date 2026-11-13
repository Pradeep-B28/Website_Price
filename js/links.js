// Helper to format outbound links with UTM tags and security attributes
import { CONFIG } from "../config.js";

export function addUtmParams(baseUrl) {
  try {
    const url = new URL(baseUrl, CONFIG.website);
    if (CONFIG.utm) {
      if (CONFIG.utm.source) url.searchParams.set("utm_source", CONFIG.utm.source);
      if (CONFIG.utm.medium) url.searchParams.set("utm_medium", CONFIG.utm.medium);
      if (CONFIG.utm.campaign) url.searchParams.set("utm_campaign", CONFIG.utm.campaign);
    }
    return url.toString();
  } catch (err) {
    return baseUrl;
  }
}

export function getHomeUrl() {
  return addUtmParams(CONFIG.website);
}

export function getProgramUrl() {
  const base = CONFIG.program?.page
    ? `${CONFIG.website}/${CONFIG.program.page}`
    : CONFIG.website;
  return addUtmParams(base);
}

export function getWhatsAppShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function getSalesWhatsAppUrl(message) {
  if (!CONFIG.salesWhatsApp) return "";
  return `https://wa.me/${CONFIG.salesWhatsApp}?text=${encodeURIComponent(message)}`;
}
