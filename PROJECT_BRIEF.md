# The Website Price Tag: Project Brief (Project 14)

A Wrench Wise web project for PC and mobile. The visitor picks the kind of website they dream of and its features. A taxi-style meter ticks up the price an agency in India would likely charge. It ends with one line: **"₹1,20,000 to get this made. Or learn to build it yourself."**

The pricing engine is already built and tested. Your job is the website around it: professional, attractive, fast, with a smooth loader, hover effects and micro-interaction animations. Target build time: **1 hour**.

Read this whole file before writing any code.

---

## 1. What we're building

**Who it is for:** anyone with a website idea. Shop owners, freelancers, students, founders. No coding knowledge needed.

**The flow (one page, three steps):**
1. **Pick a type.** 15 kinds of website, from a landing page to a social app. Each card shows its price range and build time.
2. **Add features.** 21 features in 5 groups. Each switch shows what it adds. The meter ticks up, like a taxi meter, every time something changes.
3. **Your price tag.** A printed-receipt view: every line sorted from the biggest cost, the total range, the estimate for the chosen agency size, build time and yearly running cost. Then the end line, the skills you would use to build it, and the CTA.

**The reel moment:** "Try a sample" picks *Restaurant or cafe*, then adds 2 extra pages, a logo, WhatsApp and table booking one by one. The meter ticks up after each, then the receipt prints: **"₹1,20,000 to get this made. Or learn to build it yourself."** The engine guarantees this exact number.

**Why they will build:** the receipt turns every feature into a skill ("10 skills"), then sells the **Certification Program in AI-Powered Full Stack Development** (name from `config.js`).

**Trust comes first.** Every price is a range from published 2026 Indian price guides, labelled as an estimate, with the sources linked on the page. Inflated or unlabelled numbers would hurt Wrench Wise.

---

## 2. Hard rules

1. **Plain HTML, CSS and JavaScript.** ES modules, no frameworks, no libraries, no npm packages in the site, no build step. One `index.html`.
2. **Locked files.** Never edit `js/engine/prices.js`, `js/engine/pricing.js` or `tools/verify.mjs`. `verify.mjs` checks their fingerprints. If you think one is wrong, stop and tell me.
3. **Nothing leaves the device.** No analytics, no tracking, no outside fonts, scripts, images or icon sets. No `fetch`. The only ways off the page are normal links the visitor clicks: wrench-wise.com, WhatsApp and the 3 price sources.
4. **The privacy lock.** `vercel.json` (given) sends a Content-Security-Policy. Put the same policy in a `<meta http-equiv="Content-Security-Policy">` tag in `index.html`, without `frame-ancestors` (meta tags ignore it). Because of the lock, `index.html` has no inline scripts, no `<style>` tags, no `style=""` attributes and no `onclick=""`. Setting `element.style` or CSS variables from JavaScript is fine. Use `meta` tags for link previews, with no canonical `link` tag.
5. **One source for every number.** Every price, range, week count, yearly cost, skill list and receipt order comes from `quote()`. The meter only shows values from `meterSteps()`. Rupees are written only with `formatINR()` or `shortINR()`. Every change goes through `setType()`, `toggleFeature()`, `setCount()` or `setTier()`. Never type a rupee amount or do price maths anywhere else. `verify.mjs` flags hand-typed amounts like `1,20,000`.
6. **Always labelled as an estimate.** The words come from `copy.js`: the hero note, the meter label "Estimated fare", the receipt note and the Sources section. The Sources section must be on the page with all 3 links. Never remove the estimate wording, never round a range into one "exact" price, never show a price without its range nearby.
7. **Storage.** `localStorage` may hold only `wpt-theme` and `wpt-pick` (saved as `encodePick(pick)`). `sessionStorage` may hold only `wpt-intro-seen`. Use them only in `js/store.js` and `js/theme-init.js`, wrapped in try and catch. The site must work when storage is blocked. Read a saved pick back only with `decodePick()`. If it returns `null`, start fresh.
8. **Share links.** A share link is `siteUrl + "/#" + encodePick(pick)`. On load, read `location.hash` only with `decodePick()`. If it gives a pick with a type, open it with the receipt showing, then clear the hash with `history.replaceState`. A share link holds only feature names, nothing personal.
9. **Tone.** Calm, honest and encouraging. Never call agencies expensive or unfair, never say "save ₹X", never promise a job or a result. Never use these where a user can see them: stupid, dumb, useless, guarantee, placement, salary, lakh, "get hired", "seats left", "100% accurate", cheapest, best price, or any countdown.
10. **Words.** All text comes from `js/copy.js` through `t()`. Program names always use the full name from `config.js`. No emojis. No em dashes.
11. **Safety.** Never use `innerHTML`, `outerHTML` or `insertAdjacentHTML`. Build elements with `createElement` and `textContent`. No `console` output. No `alert()`, `confirm()` or `prompt()`. Use the inline confirm described in 6H.
12. **No overlap.** Nothing overlaps, clips or scrolls sideways at 320, 360, 390, 768, 1024, 1280 or 1440 px wide. The phone meter bar never covers the last button on the page: add bottom padding equal to its height.
13. **No placeholder look.** No grey boxes, lorem ipsum, stock photos, emoji icons or unfinished sections. Remove any debug panel before Phase 4 ends.
14. **Phone first.** Tap targets at least 44 px. Text in inputs at least 16 px so phones do not zoom. The meter is always visible on phones as a bottom bar. Everything works with a keyboard alone.

---

## 3. Keep it easy to upgrade

- The engine has no page code, and the page has no prices. A yearly price update only changes `prices.js`.
- Types, features, groups, tiers, skills and sources are drawn from the engine's arrays. Never write a list of them in `index.html`. Adding a type later means adding it to `prices.js` and `copy.js` only.
- Each part of the page has its own file (Section 4). Keep files under about 250 lines.
- Every switch in `config.features` must hide its feature completely, with no errors.
- All colours, radii, shadows and timings are CSS variables in `styles/tokens.css`.

---

## 4. Files

```
website-price-tag/
  index.html              you build
  favicon.svg             you build (brand gradient rounded square, white "W")
  config.js               given. Values only. I fill in salesWhatsApp, you fill in siteUrl in Phase 4
  vercel.json             given
  PROJECT_BRIEF.md        given
  assets/logo.png         I add
  assets/og-image.png     you make in Phase 4
  styles/
    tokens.css            colours, sizes, timings (Section 7)
    base.css              reset, type, focus rings, reduced motion
    layout.css            page grid, header, footer, sections
    components.css        cards, switches, steppers, chips, buttons, receipt, meter
    motion.css            loader, ticks, flips, fly chips, print, reveal
  js/
    engine/prices.js      LOCKED. All prices, sources and the sample
    engine/pricing.js     LOCKED. quote(), meterSteps(), formats, saving
    copy.js               given. Do not change the words without asking me
    theme-init.js         classic script in <head>: sets the theme before paint
    store.js              storage and reading the share hash
    app.js                start-up, the current pick, wiring between parts
    loader.js             6A
    types-ui.js           6E
    features-ui.js        6F
    meter-ui.js           6G
    receipt-ui.js         6H and 6I
    share-ui.js           6J
    dsa-ui.js             6K
    sources-ui.js         6L
    links.js              program and WhatsApp links with UTM tags
    reveal.js             scroll reveal
    selftest.js           ?test=1 page (Section 10)
  tools/verify.mjs        LOCKED
```

`app.js` holds the one current pick. Every change makes a new pick through the engine, saves it with `store.js`, then calls `render(pick, quote(pick))` on each part. Parts never change the pick themselves. They call back into `app.js`.

---

## 5. Engine: what to call

Import from `js/engine/pricing.js`.

| Call | Gives back |
|---|---|
| `TYPES`, `FEATURES`, `GROUPS`, `TIERS`, `SKILLS`, `SAMPLE` | The lists to draw from, in display order |
| `getType(id)`, `getFeature(id)`, `featuresInGroup(group)` | One item, or the features of a group |
| `emptyPick()` | A fresh pick with no type, tier `mid` |
| `setType(pick, id)` | `{ pick, reason }`. Drops features the new type already includes |
| `toggleFeature(pick, id)` | `{ pick, reason }`. For `add` and `percent` features |
| `setCount(pick, id, n)` | `{ pick, reason }`. For `pages` (0 to 30) and `tools` (0 to 5) |
| `setTier(pick, tier)` | `{ pick, reason }`. `small`, `mid` or `large` |
| `isOn(pick, id)`, `isIncluded(typeId, id)` | true or false |
| `quote(pick)` | Everything shown on the page (below) |
| `meterSteps(from, to, maxSteps)` | The values the meter shows on its way to the new price |
| `formatINR(n)`, `shortINR(n)` | `"1,20,000"` and `"1.2L"` / `"25k"`. Add the ₹ through `copy.js` |
| `encodePick(pick)`, `decodePick(text)` | Text for saving and share links. `decodePick` returns `null` for bad text |
| `samplePicks()` | The sample, one pick per step. The last one prices at exactly 1,20,000 |

`reason` is `null` when the change worked, otherwise one of `unknown`, `noType`, `included`, `range`. Show `t("reasons." + reason)` near the control for 2.5 seconds. The pick does not change.

`quote(pick)` returns `{ ok: false, reason: "noType" }` until a type is picked. After that:

```
ok: true
type, tier
price                      the estimate for the chosen tier (this is the meter and the end line)
total: { low, mid, high }  the full range
lines: [ { id, kind, count, low, high, mid, pct? } ]   kind is base, add, count or percent
byCost                     the same lines, biggest first (the receipt order)
drivers                    ids of the 3 biggest lines
extras                     number of lines after the base
included                   ids of features that come free with this type
weeks: { low, high }
yearly: { low, high }      domain, hosting and upkeep each year
skills                     skill ids, in display order, no repeats
pages                      total pages
```

A `base` line's id is a type id. All other line ids are feature ids. Names come from `t("types." + id + ".name")` or `t("features." + id + ".name")`.

---

## 6. The page, top to bottom

**A. Loader.** First visit in a session only (`wpt-intro-seen`). A small dark meter card in the centre: the amber "FOR HIRE" flag flips down (rotateX), then the digits tick from 0 to the sample price using `meterSteps(0, quote(samplePicks().at(-1)).price, 24)`, then the card scales down to 0.96 and fades as the page fades up. Show it at least `config.loader.minMs`, never longer than `config.loader.maxMs`. As a safety net, `motion.css` hides the loader with a CSS animation after 3 seconds even if JavaScript fails. Repeat visits in the session skip it.

**B. Header.** Sticky, white with blur, the brand gradient bar under it (3 px). Logo on the left links to the main site. On the right: theme toggle (sun and moon icons that rotate and cross-fade) and "Explore programs" pill button.

**C. Hero.** Eyebrow pill, the title, the body, two buttons ("Start the meter" scrolls to Step 1, "Try a sample" runs 6P) and the small estimate note under them. On PC, the right side shows the meter (6G) already, idle, with ghost digits. On phones the hero is text only.

**D. Stepper.** Three pills: Pick a type, Add features, Your price tag. A step turns into a check (scale pop) once done. The line between steps fills with the brand gradient. Sticky under the header on PC only.

**E. Step 1: Types.** A grid of 15 cards: 3 columns at 1024 px and up, 2 at 600 to 1023, 1 compact column below 600. Each card: a simple line icon from the SVG sprite, the name, the description (2 lines max), the range as `₹25k to ₹70k` (`shortINR`) and the weeks. Cards are buttons with `aria-pressed`. On phones, show the first 8 and a "Show all 15" button. Choosing a card: the card fills with `--brand-soft`, a check badge pops in at the top right, the meter starts, and the page scrolls smoothly to Step 2.

**F. Step 2: Features.** Five group cards with their heading. Before a type is picked, the whole step is dimmed to 50% with the `featureStep.noType` line on top, and taps show that line. Each feature is one row:
- `add` and `percent`: a switch (`role="switch"`, `aria-checked`), the name, the description and a price chip (`featureStep.add` or `featureStep.percent`).
- `count`: a stepper (minus, number, plus) with the unit, for example "2 extra pages", and the `perUnit` chip. Minus is disabled at 0, plus at the max.
- Included in this type: the switch is on and locked, with an "Included" chip and a small lock icon. The hint `featureStep.includedHint` shows on hover or focus.
Under the groups: "See my price tag" (primary) and "Change type" (text button).

**G. The meter.** The heart of the page.
- **Look:** a dark rounded panel (`--meter-bg` in both themes), like a taxi meter. Top row: the label "Estimated fare" and the amber flag (`FOR HIRE` before a type, `METER ON` after, flipping when it changes). Then the big digits in a monospace font with `font-variant-numeric: tabular-nums` and an emerald glow, with dim ghost digits behind them, made with `formatINR(888888)` (seven-segment feel). Under that: the range line, the weeks line, "Base fare" with the type name and "Extras" with the count. Then "Who builds it?" as a 3-part segmented switch (Small studio, Mid-size agency, Established agency) with a sliding pill, and "Get my price tag".
- **PC (1024 px and up):** a sticky panel in a right column, 360 px wide, `top` just under the header.
- **Below 1024 px:** a bar fixed to the bottom (72 px plus the safe area): flag, digits and a "Show details" button. It opens a bottom sheet (`role="dialog"`) with the full meter. The sheet closes with its close button, a tap outside or Esc, and returns focus.
- **Ticking:** when the price changes, show each value of `meterSteps(shown, next, config.meter.maxSteps)` every `config.meter.tickMs`. If another change arrives mid-tick, start again from the value showing now. Each tick nudges the last digit up 2 px and back. When it lands, the digits glow brighter for 300 ms.
- **Fly chip:** after a feature change, a small chip with `meter.added` or `meter.removed` (the change in `quote().price`, written with `formatINR`) rises from the row and flies to the meter digits (on phones, to the bar), then fades. Skip it when the change is 0.
- **Screen readers:** one polite `aria-live` region announces `a11y.meterLive` once the meter lands. Never announce every tick.

**H. Step 3: Your price tag.** Hidden until "Get my price tag", a share link or the sample. After that it stays and updates live.
- **The receipt:** a paper card (white in light, `--paper` in dark) with a torn zig-zag bottom edge made with CSS only. Header: "Your price tag", the type name and today's date (`toLocaleDateString("en-IN")`). Then the lines in `byCost` order: name on the left, dotted leader, `receipt.lineRange` on the right. Count lines read like "2 extra pages". Percent lines use `receipt.linePercent`. Then the included chips, a dashed rule, the total range, the tier estimate in large type, build time, running cost each year with its note, and the estimate note in small muted text.
- **Print animation:** the first time it appears, the receipt slides out of a dark slot (the bottom of a mini meter) with `clip-path`, lines fade in 40 ms apart, then the tier estimate counts up with `meterSteps(0, price, 30)`.
- **The end line:** under the receipt, centred and large. `receipt.endPrice` in the heading colour, then `receipt.endLearn` in the brand gradient text on its own line. Buttons: "Learn to build it" (primary, opens the program link in a new tab) and "Share my price tag" (scrolls to 6J). Small text buttons: "Change my picks" (scrolls to Step 2) and "Start again", which shows an inline confirm row (`restartAsk`, Yes, No) instead of a browser box.

**I. Skills and CTA.** A card titled "Skills you would use to build it" with the count chip (`skills.count`) and one chip per id in `quote().skills`. Chips pop in 30 ms apart. Then the CTA card with the brand gradient top edge: title, body with the full program name, "Explore the program" and, if `config.salesWhatsApp` is set, "Talk to us on WhatsApp" with `cta.whatsAppText` (the type name filled in).

**J. Share.** "Share on WhatsApp" opens `https://wa.me/?text=` with `share.text`, filled with the price and the share link. "Copy link" uses `navigator.clipboard.writeText`. On success the button shows a check and "Link copied" for 2 seconds. If copying fails, show the link in a read-only input, select it and show `share.copyFailed`. If `config.siteUrl` is empty, use `location.origin + location.pathname`.

**K. How it works.** Four small cards: Hash map, Running sum, Sorting, Set. Each has its short explanation and a live line filled from `quote()`:
- `mapLive` count = `lines.length + included.length`
- `sumLive` base = the price of the type alone at the chosen tier (`quote(setTier(setType(emptyPick(), type).pick, tier).pick).price`), total = `price`
- `sortLive` name = the name of `byCost[0]`
- `setLive` parts = `lines.length + included.length`, count = `skills.length`
Before a type is picked, show `dsa.idle` instead of the live lines.

**L. Sources.** Title, body, the "last checked" line and the 3 links (names from `copy.sources.names`, URLs from `SOURCES` in `prices.js`), each opening in a new tab with `rel="noopener noreferrer"`. A "Show every range" disclosure (`<details>`) lists every type and feature with its range and a small label: "From the guides" (`basis: "src"`) or "Estimated" (`basis: "est"`).

**M. Footer.** Logo, `footer.built`, `footer.privacy`, link to wrench-wise.com.

**N. Theme.** Light and dark. The first visit follows the device. The toggle saves `wpt-theme`. `theme-init.js` runs in `<head>` so the page never flashes the wrong theme.

**O. Saving.** After every change, save `encodePick(pick)`. On load, the order is: share hash first, then saved pick, then fresh. If a saved pick has a type, restore it with the meter already at its price (no ticking) and the receipt hidden until "Get my price tag".

**P. Try a sample.** Disabled while running. Scroll to Step 1, then apply `samplePicks()` one pick every `config.sample.stepMs`, with every normal animation (card select, switch flip, fly chip, meter tick). After the last one, show the receipt with its print animation and scroll to the end line. If the visitor touches anything during the sample, stop it and keep what is there.

**Links.** Every link to wrench-wise.com carries `utm_source`, `utm_medium` and `utm_campaign` from `config.utm`, added in `links.js`. Links leaving the site open in a new tab with `rel="noopener noreferrer"`.

---

## 7. Visual style: matched to wrench-wise.com

Emerald as the main colour, teal and cyan as accents, grey text, white cards and soft emerald-to-cyan gradients. Amber is used only for the meter flag. Every colour is a CSS variable in `styles/tokens.css`.

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F172A` |
| `--bg-grad` | `linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 45%, #ECFEFF 100%)` | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F3F4F6` | `#334155` |
| `--border` | `#E5E7EB` | `#334155` |
| `--text` | `#111827` | `#F1F5F9` |
| `--text-2` | `#374151` | `#CBD5E1` |
| `--muted` | `#6B7280` | `#94A3B8` |
| `--brand` | `#059669` | `#10B981` |
| `--brand-strong` | `#047857` | `#34D399` |
| `--brand-soft` | `#D1FAE5` | `rgba(16,185,129,0.15)` |
| `--accent` | `#0891B2` | `#22D3EE` |
| `--paper` | `#FFFFFF` | `#111827` |
| `--meter-bg` | `#0B1220` | `#0B1220` |
| `--meter-edge` | `#1F2937` | `#1F2937` |
| `--meter-digit` | `#34D399` | `#34D399` |
| `--meter-ghost` | `rgba(52,211,153,0.08)` | `rgba(52,211,153,0.08)` |
| `--meter-flag` | `#FBBF24` | `#FBBF24` |
| `--meter-flag-text` | `#111827` | `#111827` |

**Brand gradient:** `--brand-grad: linear-gradient(90deg, #059669, #0D9488, #06B6D4)`. Use it for primary buttons, the bar under the header, the stepper line, the switch track when on, the end line's second sentence and the CTA card's top edge.

**Fonts:** `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Headings weight 800, letter spacing -0.01em. Meter digits: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`, weight 700, `tabular-nums`, glow `text-shadow: 0 0 14px rgba(52,211,153,0.45)`. Digit size: 44 px on PC, 28 px in the phone bar.

**Shapes:** buttons, pills, chips and the tier switch 999px. Cards 16px. The meter 20px. Inputs 12px.

**Shadows** (in dark, same shapes with `rgba(0,0,0,0.40)`):
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`
- `--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`
- `--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)`
- `--shadow-meter: 0 20px 40px -12px rgba(5,150,105,0.35)`

**Icons:** one inline SVG sprite at the top of `index.html` (`<symbol>` per icon, used with `<use href="#i-name">`). 24 px, stroke 1.75, round caps, `currentColor`. One icon per website type, plus check, lock, plus, minus, chevron, close, sun, moon, chat, link and refresh. Drawn simply in the same style. No icon libraries.

**Hover effects** (only inside `@media (hover: hover)`):
- Buttons lift 2 px with `--shadow-md`. The primary button also slides its gradient (`background-size: 200%`, move position).
- Type cards and group cards lift 3 px with `--shadow-lg` and a soft brand border. The type icon tilts 6 degrees.
- Feature rows get a `--surface-2` background. The price chip turns brand coloured.
- Source links underline from left to right.

**Micro-interactions:**
- Every button presses down to `scale(0.97)` on `:active`.
- Switch knob slides with a spring curve `cubic-bezier(0.34, 1.56, 0.64, 1)`, the track fills with the brand gradient, the row flashes `--brand-soft` for 400 ms.
- Stepper numbers roll up or down (old number slides out, new one slides in).
- The check badge on a chosen type card pops (scale 0 to 1.15 to 1).
- Meter: tick nudge, landing glow, flag flip, fly chip (6G).
- Tier switch: the pill slides to the chosen option in 250 ms.
- Receipt print, staggered lines and count-up (6H). Skill chips pop in one by one.
- "Copy link" turns into a check with "Link copied".
- Sections fade and rise 16 px as they scroll into view (`IntersectionObserver`, once).

**Timing:** most moves 180 to 250 ms with `cubic-bezier(0.2, 0.8, 0.2, 1)`. Nothing over 900 ms except the loader and the sample.

**Reduced motion:** with `prefers-reduced-motion: reduce`, no ticking (the meter jumps to the new price), no fly chips, no flips, no print slide, no reveal. Colour changes stay.

**Accessibility:** visible focus rings (2 px `--accent`, 2 px offset). Switches, steppers, the tier switch and type cards all work with Tab, Enter and Space. Text contrast at least 4.5:1 in both themes. Skip link `a11y.skip` to the meter.

**Meta:** `theme-color` `#FFFFFF` and `#0F172A` by media query. Title and description from `copy.meta`. `og:` and `twitter:` tags with `og-image.png`.

---

## 8. Words

Use `js/copy.js` as it is. Every line is already written. Do not add other visible text without asking me.

---

## 9. Analytics

None, on purpose (rule 3). The UTM tags on links to wrench-wise.com show visits from this project in the main site's reports.

---

## 10. Correctness

**`node tools/verify.mjs`** checks the price data, the sample's exact numbers, every engine rule, 3,000 random picks, the meter, the rupee formats, damaged saved data, the copy, the locked files and the rules across all your files. It must pass at the start of every phase and before deploy.

**`?test=1`** opens a self-test page from `js/selftest.js`, listing PASS or FAIL per line. It runs the real page code with animations off:
1. The sample, run through the real page, ends with the meter showing "1,20,000" and the end line reading exactly "₹1,20,000 to get this made."
2. The meter range reads "Range ₹62,000 to ₹1,78,000" and the weeks read "5 to 10 weeks to build".
3. The receipt lines read, in order: Base build: Restaurant or cafe, Appointment booking, WhatsApp chat and alerts, Logo and brand kit, 2 extra pages.
4. Small studio shows 62,000 and Established agency shows 1,78,000.
5. Choosing Online store shows Online payments, Search and filters, Sign-up and login and Admin dashboard as Included, and their switches cannot be turned off.
6. Business website with Online payments on, then switched to Online store, has no Online payments line on the receipt.
7. The Extra pages stepper stops at 0 and at 30.
8. Before a type is picked, tapping a feature shows "Pick a website type first." and changes nothing.
9. The WhatsApp share link starts with `https://wa.me/?text=` and, decoded, equals `share.text` filled with the price and the share link.
10. Opening the page with `#t=restaurant&f=logo,whatsapp,booking&pages=2&tools=0&tier=mid` shows the receipt with 1,20,000, and the hash is then cleared.
11. Opening the page with a damaged hash such as `#t=<x>` starts fresh with no errors.
12. After a reload, the same picks come back.
13. Storage holds only allowed keys.
14. All 3 source links are on the page, match `SOURCES`, and open in a new tab with `rel="noopener noreferrer"`.
15. The hero note, the meter label and the receipt estimate note are all visible.
16. `document.documentElement.scrollWidth` is not larger than the window width.

Also check by hand on a real phone: the bottom bar never hides a button, the sheet opens and closes, the sample runs smoothly, and nothing scrolls sideways.

---

## 11. Phases

Stop after every phase, give me the Phase Report, and wait for me to say "Go".

**Phase 1: Shell and loader (10 min).** Git, `index.html` with the privacy lock and the SVG sprite, tokens, themes, header, footer, loader, stepper, the PC and phone layouts with empty cards, `store.js`, `theme-init.js`, `favicon.svg`.

**Phase 2: Pick and meter (20 min).** Type cards, feature groups, switches, steppers, included states, the meter on PC and as the phone bar and sheet, ticking, fly chips, the tier switch, saving and loading, with all their micro-interactions.

**Phase 3: Price tag and the rest (15 min).** Receipt with print animation, end line, inline confirm, skills, CTA, share (WhatsApp, copy link, share hash), Try a sample, how it works, sources with every range, hover effects, scroll reveal.

**Phase 4: Finish and deploy (15 min).**
1. Build `?test=1`. Fix everything until it passes. Check every width in rule 12 and both themes. Check reduced motion.
2. Make `og-image.png` (1200 x 630, Wrench Wise colours, the line "What would your dream website cost?", the dark meter showing ₹1,20,000 on the right).
3. Help me push the folder to GitHub. I will give you my empty repository URL.
4. Deploy on Vercel as a static site with no build command.
5. Set `config.siteUrl`, `og:url` and `og:image` to the live address, then redeploy.
6. Give click-by-click steps for anything I must do myself.
7. Confirm the live site works on a phone-sized screen, that `?test=1` passes live, and that a share link opened in a new tab shows the same price.
8. Tag the release `v1.0.0`, push the tag and give me the live link.

---

## 12. Phase Report format

- **What I built** (3 to 5 bullets)
- **How to check it** (click steps)
- **Screenshots** (phone and laptop, light and dark)
- **verify.mjs result**
- **Not working or cut,** explained in plain words
- **Time used** against the target

---

## 13. If something keeps breaking

- If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
- If I say "Park it", move that feature to a "Parked" list in the Phase Report and continue.
- If time runs short, park in this order:
  1. "Show every range" in Sources (keep the 3 links)
  2. Scroll reveal
  3. "Show all 15" on phones (show all cards)
  4. Receipt print slide (keep the count-up)
  5. Fly chips
  6. The sample ticking step by step (apply the final sample pick at once, keep the receipt)
- Never park: the meter ticking, the estimate labels, the Sources links, the end line, the CTA, or anything in Section 2.
