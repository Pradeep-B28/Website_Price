// Every word a visitor can see. Use t("group.key", { values }) to read it.
// Rules: plain words, no emojis, no long dashes, never promise jobs or results.
// Prices are always shown with the rupee sign, written here, never typed in other files.

export const COPY = {
  meta: {
    title: "The Website Price Tag | Wrench Wise",
    description: "Pick the features of your dream website and watch a taxi-style meter show what an agency in India would likely charge. Then learn to build it yourself.",
    ogTitle: "What would your dream website cost?",
    ogDescription: "Pick the features. Watch the meter. Then learn to build it yourself."
  },
  loader: {
    flag: "FOR HIRE",
    label: "Starting the meter"
  },
  header: {
    home: "Wrench Wise home",
    programs: "Explore programs",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme"
  },
  hero: {
    eyebrow: "A free tool by Wrench Wise",
    title: "What would your dream website cost?",
    body: "Pick the kind of website and the features you want. A taxi-style meter shows what an agency in India would likely charge to build it.",
    start: "Start the meter",
    sample: "Try a sample",
    note: "Estimates from published 2026 price guides for India."
  },
  steps: {
    label: "Progress",
    one: "Pick a type",
    two: "Add features",
    three: "Your price tag"
  },
  typeStep: {
    title: "What kind of website?",
    body: "Pick the one closest to your idea. You can change it later.",
    range: "₹{low} to ₹{high}",
    weeks: "{low} to {high} weeks",
    pagesOne: "1 page included",
    pagesMany: "{pages} pages included",
    selected: "Selected"
  },
  types: {
    landing: { name: "Landing page", desc: "One page for a launch, an offer or an event sign-up." },
    portfolio: { name: "Portfolio or personal site", desc: "Show your work, your resume and how to reach you." },
    event: { name: "Wedding or event site", desc: "Date, venue, schedule, photos and RSVP." },
    business: { name: "Business website", desc: "Home, about, services and contact for a company or shop." },
    restaurant: { name: "Restaurant or cafe", desc: "Menu, photos, location and opening hours." },
    school: { name: "School, coaching or NGO", desc: "Courses or causes, team, gallery and enquiries." },
    blog: { name: "Blog or content site", desc: "Articles you can publish and edit yourself." },
    bookingSite: { name: "Booking site", desc: "Clinics, salons, gyms and tutors taking appointments online." },
    store: { name: "Online store", desc: "Products, cart, checkout and an admin page for orders." },
    property: { name: "Property listings", desc: "Homes or plots with photos, filters and enquiry forms." },
    news: { name: "News or magazine portal", desc: "Many writers, many sections and new articles every day." },
    courses: { name: "Online course platform", desc: "Video lessons, student logins and paid enrolment." },
    saas: { name: "Web app or SaaS", desc: "A tool people log in to use, like a CRM or a dashboard." },
    marketplace: { name: "Marketplace or job portal", desc: "Many sellers or employers, many buyers or job seekers." },
    community: { name: "Social or community app", desc: "Profiles, posts, follows and live chat between members." }
  },
  groups: {
    content: "Pages and content",
    look: "Look and feel",
    users: "Users and accounts",
    money: "Payments and bookings",
    connect: "Connect and grow"
  },
  featureStep: {
    title: "What should it do?",
    body: "Switch on what you need and watch the meter.",
    noType: "Pick a website type first.",
    included: "Included",
    includedHint: "Comes with your website type.",
    add: "+₹{low} to ₹{high}",
    percent: "+{low}% to {high}% of the build",
    perUnit: "₹{low} to ₹{high} each",
    less: "One less",
    more: "One more",
    next: "See my price tag",
    back: "Change type"
  },
  features: {
    pages: { name: "Extra pages", desc: "More pages beyond what your website type includes.", one: "extra page", many: "extra pages" },
    cms: { name: "Edit it yourself (CMS)", desc: "Change text, photos and posts without a developer." },
    content: { name: "Writing and content", desc: "A writer prepares the words for your pages." },
    seo: { name: "Google search setup (SEO)", desc: "Titles, descriptions and a sitemap so Google can find you." },
    multilang: { name: "Two or more languages", desc: "For example English and Tamil, with a language switch." },
    customDesign: { name: "Custom design from scratch", desc: "A look made only for you instead of a ready-made theme." },
    animations: { name: "Animations and motion", desc: "Smooth scroll effects, hover effects and moving sections." },
    logo: { name: "Logo and brand kit", desc: "Logo, colours and fonts that match your brand." },
    login: { name: "Sign-up and login", desc: "Visitors create accounts and log in safely." },
    roles: { name: "Different user types", desc: "For example admin, staff and customer, each seeing different things." },
    adminPanel: { name: "Admin dashboard", desc: "A private page to manage orders, users and content." },
    liveChat: { name: "Live chat between users", desc: "Messages that appear instantly, like a chat app." },
    payments: { name: "Online payments", desc: "UPI, cards and wallets. The gateway also keeps about 2% of each payment." },
    subscriptions: { name: "Monthly subscriptions", desc: "Charge customers every month or year automatically." },
    booking: { name: "Appointment booking", desc: "Visitors pick a free slot on a calendar and book it." },
    whatsapp: { name: "WhatsApp chat and alerts", desc: "A WhatsApp button plus order or booking messages." },
    tools: { name: "Connect other software", desc: "Link a CRM, shipping, accounting or other tool.", one: "tool connected", many: "tools connected" },
    search: { name: "Search and filters", desc: "Find items fast by name, price, place or category." },
    ai: { name: "AI chatbot", desc: "Answers visitor questions using an AI model." },
    analytics: { name: "Visitor tracking", desc: "See how many people visit and what they click." },
    migration: { name: "Move from an old website", desc: "Bring over pages, posts or products from your current site." }
  },
  meter: {
    label: "Estimated fare",
    flagIdle: "FOR HIRE",
    flagOn: "METER ON",
    idle: "Pick a website type to start the meter.",
    base: "Base fare",
    extras: "Extras",
    extrasNone: "None yet",
    extrasCount: "{count} added",
    range: "Range ₹{low} to ₹{high}",
    weeks: "{low} to {high} weeks to build",
    tierTitle: "Who builds it?",
    open: "Show details",
    close: "Hide details",
    go: "Get my price tag",
    added: "+₹{amount}",
    removed: "-₹{amount}"
  },
  tiers: {
    small: { name: "Small studio", desc: "Usually quotes near the low end." },
    mid: { name: "Mid-size agency", desc: "Usually quotes near the middle." },
    large: { name: "Established agency", desc: "Usually quotes near the high end." }
  },
  receipt: {
    title: "Your price tag",
    lineBase: "Base build: {type}",
    lineCount: "{count} {unit}",
    linePercent: "{name} ({low}% to {high}%)",
    lineRange: "₹{low} to ₹{high}",
    includedTitle: "Included at no extra cost",
    total: "Estimated total",
    tierPrice: "{tier} estimate",
    weeks: "Build time",
    weeksValue: "{low} to {high} weeks",
    yearly: "Running cost each year",
    yearlyValue: "₹{low} to ₹{high}",
    yearlyNote: "Domain, hosting and upkeep. Upkeep is usually 10 to 15% of the build cost every year.",
    drivers: "Biggest costs",
    estimate: "These are estimates, not quotes. Real prices change with the city, the team, the content and how often the plan changes.",
    endPrice: "₹{price} to get this made.",
    endLearn: "Or learn to build it yourself.",
    learn: "Learn to build it",
    edit: "Change my picks",
    restart: "Start again",
    restartAsk: "Clear all your picks?",
    restartYes: "Yes, clear",
    restartNo: "Keep them"
  },
  skills: {
    title: "Skills you would use to build it",
    count: "{count} skills",
    body: "Every line on your price tag is something you can learn to build.",
    names: {
      html: "HTML",
      css: "CSS",
      responsive: "Responsive design",
      js: "JavaScript",
      git: "Git and GitHub",
      deploy: "Putting it live",
      uiux: "UI design",
      seo: "SEO basics",
      react: "React",
      node: "Node.js",
      database: "Databases",
      auth: "Login and security",
      payments: "Payment gateways",
      apis: "APIs",
      realtime: "Real-time updates",
      ai: "AI APIs"
    }
  },
  share: {
    title: "Share your price tag",
    whatsApp: "Share on WhatsApp",
    copy: "Copy link",
    copied: "Link copied",
    copyFailed: "Could not copy. Select the link and copy it.",
    text: "My dream website would cost about ₹{price} to get made by an agency in India. Find your website's price tag: {url}"
  },
  dsa: {
    title: "How the meter works",
    body: "Four ideas from data structures and algorithms run this page.",
    mapTitle: "Hash map",
    map: "Every type and feature is stored by its name, so its price is found in one step, however many there are.",
    mapLive: "It looked up {count} prices for your website.",
    sumTitle: "Running sum",
    sum: "The meter adds each price to a running total, then adds the percentage extras on top of that total.",
    sumLive: "Your total went from a base of ₹{base} to ₹{total}.",
    sortTitle: "Sorting",
    sort: "Your receipt is sorted from the biggest cost to the smallest, so you see what drives the price first.",
    sortLive: "Your biggest cost is {name}.",
    setTitle: "Set",
    set: "Skills are collected in a set, so a skill needed by three features is counted only once.",
    setLive: "{parts} parts of your website need {count} different skills.",
    idle: "Pick a website type to see your own numbers here."
  },
  sources: {
    title: "Where the prices come from",
    body: "Each range comes from a published 2026 price guide for India. Where a guide does not price a feature on its own, we estimated it from the gap between the guide's price tiers. Prices do not include GST.",
    checked: "Prices last checked in November 2026.",
    sourced: "From the guides",
    estimated: "Estimated",
    names: {
      hostinger: "Hostinger India: How much does a website cost in India in 2026?",
      nodeascend: "NodeAscend: Website development cost in India 2026",
      ravirai: "Build by Ravi Rai: Website development cost in India 2026"
    }
  },
  cta: {
    title: "Learn to build websites like this",
    body: "Every feature on your price tag is a skill you can learn. Build complete, working websites step by step in the {program}.",
    button: "Explore the program",
    whatsApp: "Talk to us on WhatsApp",
    whatsAppText: "Hi, I priced my dream website ({type}) on The Website Price Tag. I want to learn to build it myself. Please tell me about the {program}."
  },
  privacy: "Your picks stay on your device. Nothing is sent anywhere.",
  footer: {
    built: "Built by Wrench Wise",
    privacy: "Your picks stay on your device."
  },
  reasons: {
    unknown: "Something went wrong. Please try again.",
    noType: "Pick a website type first.",
    included: "This comes with your website type.",
    range: "That number is out of range."
  },
  a11y: {
    meterLive: "Estimated price ₹{price}.",
    skip: "Skip to the meter",
    types: "Website types",
    features: "Features"
  },
  noScript: "This page needs JavaScript to run."
};

export function t(key, values = {}) {
  const found = key.split(".").reduce((node, part) => node?.[part], COPY);
  if (typeof found !== "string") return "";
  return found.replace(/\{(\w+)\}/g, (all, name) => (values[name] ?? all).toString());
}
