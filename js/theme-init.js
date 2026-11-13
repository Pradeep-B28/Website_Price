// Set the initial theme before paint to avoid flash of incorrect theme
(function () {
  try {
    var saved = localStorage.getItem("wpt-theme");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (err) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
