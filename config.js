// All settings for The Website Price Tag. Change values here, never in other files.
// Keep this structure and these comments. See PROJECT_BRIEF.md Section 4.

export const CONFIG = {
  version: "1.0.0",

  // The live address, no slash at the end. Set in Phase 4 (deploy). Used for share links and link previews.
  siteUrl: "https://website-price-three.vercel.app",

  // Sales WhatsApp: digits only, country code first, 11 to 15 digits. Empty hides the "Talk to us" button.
  salesWhatsApp: "",

  // The program the CTA sells. Always use the full name. page is its page on wrench-wise.com, or "" for the main site.
  program: {
    name: "Certification Program in AI-Powered Full Stack Development",
    page: ""
  },

  website: "https://wrench-wise.com",
  utm: { source: "website-price-tag", medium: "web-project", campaign: "website-price-tag" },

  // Taxi meter speed. tickMs is the time between two meter values. maxSteps is passed to meterSteps().
  meter: { tickMs: 28, maxSteps: 40 },

  // Loader: shown at least minMs on the first visit of a session, never longer than maxMs.
  loader: { minMs: 900, maxMs: 2500 },

  // "Try a sample": time between two automatic picks, so the meter can be seen ticking.
  sample: { stepMs: 650 },

  // Switches. false hides the feature completely, with no errors.
  features: {
    darkTheme: true,
    sample: true,
    shareLink: true,
    howItWorks: true
  }
};
