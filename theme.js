/* Light/dark theme for every page of the site (two states, no "system" state).

   - Until the visitor clicks a toggle, the page follows the OS setting (prefers-color-scheme), live.
   - A click always flips the theme that is on screen and stores that choice in localStorage,
     so it sticks on every page, in every open tab, and after a reload.
   - Load it with a plain <script src> in the <head> so the theme is set before the first paint.

   Pages use window.siteTheme.toggle() and window.siteTheme.onChange(fn). */
(function () {
  "use strict";

  var KEY = "theme";
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var listeners = [];
  var timer;

  /* "light" | "dark" | null (no choice yet) | undefined (storage blocked) */
  function load() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") return v;
      if (v !== null) localStorage.removeItem(KEY); /* e.g. "system", left by the old three-state toggle */
      return null;
    } catch (e) {
      return undefined;
    }
  }

  var choice = load() || null;

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    for (var i = 0; i < listeners.length; i++) listeners[i](theme);
  }

  function refresh() {
    apply(choice || (mq && mq.matches ? "dark" : "light"));
  }

  function toggle() {
    choice = current() === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, choice); } catch (e) {}
    root.classList.add("theme-transition");
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { root.classList.remove("theme-transition"); }, 400);
    apply(choice);
  }

  function reload() {
    var c = load();
    if (c !== undefined) choice = c;
    refresh();
  }

  refresh();

  /* OS switches between light and dark (only matters while no choice is stored) */
  if (mq) {
    if (mq.addEventListener) mq.addEventListener("change", refresh);
    else if (mq.addListener) mq.addListener(refresh);
  }
  /* Choice made in another tab or window */
  window.addEventListener("storage", function (e) {
    if (e.key === KEY || e.key === null) reload();
  });
  /* Page restored by the Back/Forward buttons after the theme was changed elsewhere */
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) reload();
  });

  window.siteTheme = {
    get: current,
    toggle: toggle,
    onChange: function (fn) {
      listeners.push(fn);
      fn(current());
    }
  };
})();
