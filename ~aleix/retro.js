/* The old-school pages come alive here.
   - The boot screen you get when you arrive through the pi on the modern page.
   - The visitor counter in the welcome box. It counts each browser once, and only on these
     old-school pages. The count is kept by Abacus (abacus.jasoncameron.dev), a free counting
     service. No cookies, and the page address is not sent along.
   - A working Windows 95 title bar. Minimize shrinks the page into a taskbar with a little
     desktop, maximize makes it full width, close opens the Shut Down box.
   Without JavaScript the pages still work, they just stay still. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement, body = doc.body;
  var page = doc.querySelector ? doc.querySelector("table.page") : null;
  if (!page || !window.addEventListener || !html.classList) return;

  var TITLE = "Home Page - Aleix Nieto Juscafresa";
  var COUNTER = "https://abacus.jasoncameron.dev/hit/aleixnieto.github.io/oldschool-visitors";
  var bar = doc.querySelector("table.banner td.bar");
  var caps = doc.querySelector("td.caps");
  var minBtn = doc.getElementById("cap-min"), maxBtn = doc.getElementById("cap-max"), closeBtn = doc.getElementById("cap-close");
  var modern = doc.querySelector("nobr.modern a");
  var modernHref = modern ? modern.href : "../";
  var still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function el(h) { var d = doc.createElement("div"); d.innerHTML = h; return d.firstChild; }
  function rm(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function store(kind) { try { var s = window[kind]; s.setItem("r95", "1"); s.removeItem("r95"); return s; } catch (e) { return null; } }
  var local = store("localStorage"), session = store("sessionStorage");
  function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function put(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) {} }

  /* what the title-bar buttons did, kept while you move between the four pages */
  var state = { bar: false, max: false, tipped: false };
  try { var saved = JSON.parse(get(session, "aleix95") || "{}"); state.bar = !!saved.bar; state.max = !!saved.max; state.tipped = !!saved.tipped; } catch (e) {}
  function save() { put(session, "aleix95", JSON.stringify(state)); }

  var ICON = {
    doc16: '<svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#000"/><path d="M9.5 1.5v3h3" fill="#C0C0C0" stroke="#000"/><path d="M5 7.5h6M5 9.5h6M5 11.5h4" stroke="#800000"/></svg>',
    folder16: '<svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M1.5 3.5h5l1 1h7v9h-13z" fill="#FFE680" stroke="#000"/><path d="M2 6.5h12" stroke="#B8962E"/></svg>',
    globe16: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="#1E5BD8" stroke="#000"/><ellipse cx="8" cy="8" rx="3" ry="6.5" fill="none" stroke="#A9CBFF"/><path d="M1.5 8h13M3 4.5h10M3 11.5h10" stroke="#A9CBFF"/></svg>',
    pc16: '<svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="2.5" y="1.5" width="11" height="9" fill="#C0C0C0" stroke="#000"/><rect x="4" y="3" width="8" height="6" fill="#202C48"/><rect x="1.5" y="11.5" width="13" height="3" fill="#C0C0C0" stroke="#000"/></svg>',
    doc32: '<svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><path d="M6.5 2.5h14l6 6v21h-20z" fill="#fff" stroke="#000"/><path d="M20.5 2.5v6h6" fill="#DFDFDF" stroke="#000"/><rect x="9" y="11" width="15" height="4" fill="#800000"/><path d="M9 18.5h15M9 21.5h15M9 24.5h10" stroke="#808080"/></svg>',
    folder32: '<svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><path d="M2.5 6.5h10l2 2h15v18h-27z" fill="#FFE680" stroke="#000"/><path d="M3 11.5h26M3 25.5h26" stroke="#B8962E"/></svg>',
    globe32: '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#1E5BD8" stroke="#000"/><ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="#A9CBFF"/><path d="M3 16h26M5.5 9.5h21M5.5 22.5h21M16 3v26" stroke="#A9CBFF"/></svg>',
    pc32: '<svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><rect x="5.5" y="2.5" width="21" height="17" fill="#C0C0C0" stroke="#000"/><rect x="8" y="5" width="16" height="11" fill="#202C48" stroke="#808080"/><path d="M10 8.5h7M10 11.5h10" stroke="#CC4040"/><path d="M12.5 19.5h7v2h-7z" fill="#808080" stroke="#000"/><rect x="2.5" y="22.5" width="27" height="7" fill="#C0C0C0" stroke="#000"/><path d="M6 25.5h12" stroke="#808080"/><rect x="24" y="25" width="2" height="2" fill="#00B000"/></svg>',
    info32: '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#fff" stroke="#000"/><text x="16" y="24" text-anchor="middle" font-family="Times New Roman,serif" font-weight="bold" font-style="italic" font-size="22" fill="#000080">i</text></svg>'
  };

  /* ---------- visitor counter ---------- */
  var odo = doc.getElementById("odo"), cnt = doc.getElementById("cnt");
  function showCount(n) {
    var s = String(n), cells = "";
    while (s.length < 7) s = "0" + s;
    for (var i = 0; i < s.length; i++) cells += "<b>" + s.charAt(i) + "</b>";
    odo.innerHTML = cells;
    cnt.setAttribute("aria-label", "You are visitor number " + n);
  }
  function noCount() { cnt.textContent = "Thanks for stopping by."; }
  if (odo && cnt) {
    var mine = parseInt(get(local, "aleix95-visitor") || get(session, "aleix95-visitor") || "", 10);
    var robot = navigator.webdriver || /bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(navigator.userAgent || "");
    if (mine > 0) showCount(mine);
    else if (robot || !window.fetch) noCount();
    else {
      var ctl = window.AbortController ? new AbortController() : null;
      var late = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
      fetch(COUNTER, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          clearTimeout(late);
          var n = parseInt(d && d.value, 10);
          if (!(n > 0)) throw new Error("no count");
          put(local || session, "aleix95-visitor", String(n));
          showCount(n);
        })
        .catch(function () { clearTimeout(late); noCount(); });
    }
  }

  /* ---------- small helpers for the Windows parts ---------- */
  var tipEl = null, tipTimer = 0;
  function tip(target, text, above) {
    clearTip();
    if (!target) return;
    var r = target.getBoundingClientRect();
    tipEl = el('<div class="r95-tip" role="status"></div>');
    tipEl.textContent = text;
    body.appendChild(tipEl);
    var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(4, Math.min(window.innerWidth - w - 4, r.left + r.width / 2 - w / 2)) + "px";
    tipEl.style.top = Math.max(4, above ? r.top - h - 6 : r.bottom + 6) + "px";
    tipTimer = setTimeout(clearTip, 4000);
  }
  function clearTip() { clearTimeout(tipTimer); rm(tipEl); tipEl = null; }
  window.addEventListener("scroll", clearTip, { passive: true });

  function box(n) {
    var r = n.getBoundingClientRect();
    return { left: r.left + "px", top: Math.max(0, Math.min(window.innerHeight - 50, r.top)) + "px", width: r.width + "px", height: r.height + "px" };
  }
  /* the Windows 95 caption bar flying from one place to another */
  function zoom(from, to, ms) {
    return new Promise(function (done) {
      var z = el('<div class="r95-zoom" aria-hidden="true"></div>');
      z.textContent = TITLE;
      if (still || !z.animate) { done(); return; }
      body.appendChild(z);
      var an = z.animate([from, to], { duration: ms || 260, easing: "ease-in-out" });
      an.onfinish = an.oncancel = function () { rm(z); done(); };
    });
  }
  /* an old monitor switching off: the picture squeezes into a bright line, then into a dot */
  function crtOff(content, then) {
    var o = { duration: 440, easing: "ease-in", fill: "forwards" }, beam = el('<div class="r95-beam"></div>');
    body.appendChild(beam);
    content.animate([
      { transform: "scale(1,1)", filter: "brightness(1)" },
      { transform: "scale(1,.006)", filter: "brightness(2.5)", offset: .55 },
      { transform: "scale(.002,.006)", filter: "brightness(4)" }], o);
    beam.animate([
      { opacity: 0, transform: "scaleX(1)" }, { opacity: 0, transform: "scaleX(1)", offset: .45 },
      { opacity: 1, transform: "scaleX(1)", offset: .55 }, { opacity: 1, transform: "scaleX(.004)", offset: .93 },
      { opacity: 0, transform: "scaleX(0)" }], o).onfinish = then;
  }
  function dialog(title, icon, text, buttons, then) {
    var m = el('<div id="r95-modal" class="r95"><div class="r95-box r95-dlg" role="dialog" aria-modal="true" aria-labelledby="r95-dlg-title">' +
      '<div class="r95-title"><span id="r95-dlg-title"></span><button type="button" class="x" aria-label="Close"><img src="cap-close.gif" width="16" height="14" alt=""></button></div>' +
      '<div class="body">' + icon + '<div>' + text + '</div></div><div class="btns"></div></div></div>');
    var dlg = m.querySelector(".r95-dlg"), btns = m.querySelector(".btns"), first = null;
    m.querySelector("#r95-dlg-title").textContent = title;
    buttons.forEach(function (label) {
      var b = el('<button type="button" class="r95-btn"></button>');
      b.textContent = label;
      b.addEventListener("click", function () { close(label); });
      btns.appendChild(b);
      first = first || b;
    });
    m.querySelector(".x").addEventListener("click", function () { close(null); });
    function onKey(e) { if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); close(null); } }
    function close(label) { doc.removeEventListener("keydown", onKey); rm(m); if (then) then(label, dlg); }
    doc.addEventListener("keydown", onKey);
    body.appendChild(m);
    if (first) first.focus();
  }

  /* ---------- taskbar, Start menu and desktop icons (made the first time you minimize) ---------- */
  var taskbar = null, task = null, startBtn = null, menu = null, icons = null, minimized = false, busy = false;
  function here(href) {
    var a = doc.createElement("a"), p = location.pathname.replace(/index\.html?$/i, "");
    a.href = href;
    return a.pathname.replace(/index\.html?$/i, "") === p && a.host === location.host;
  }
  function clock() {
    if (!taskbar) return;
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    taskbar.querySelector("#r95-clock").textContent = (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
  }
  function ensureTaskbar() {
    if (taskbar) return;
    taskbar = el('<div id="r95-taskbar" class="r95">' +
      '<button type="button" class="r95-btn" id="r95-start" aria-haspopup="true" aria-expanded="false"><span class="pi">&pi;</span>Start</button>' +
      '<button type="button" class="r95-btn on" id="r95-task" aria-pressed="true">' + ICON.doc16 + '<span></span></button>' +
      '<div id="r95-clock"></div></div>');
    task = taskbar.querySelector("#r95-task");
    startBtn = taskbar.querySelector("#r95-start");
    task.querySelector("span").textContent = TITLE;
    body.appendChild(taskbar);
    html.classList.add("taskbar");
    clock();
    setInterval(clock, 10000);
    task.addEventListener("click", function () { hideMenu(); if (minimized) restore(); else minimize(); });
    startBtn.addEventListener("click", function () { if (menu && !menu.hidden) hideMenu(); else showMenu(); });
  }
  function item(href, icon, label) { return '<a role="menuitem" href="' + href + '">' + icon + label + '</a>'; }
  function showMenu() {
    clearTip();
    if (!menu) {
      menu = el('<div id="r95-menu" class="r95 r95-box" role="menu" hidden><div class="side"><span>Aleix<b>95</b></span></div><div class="items">' +
        item("index.html", ICON.doc16, "About") + item("news.htm", ICON.doc16, "News") + item("pubs.htm", ICON.folder16, "Publications") +
        item("teaching.htm", ICON.doc16, "Teaching") + "<hr>" + item(modernHref, ICON.globe16, "Back to 2026") +
        '<button type="button" role="menuitem" data-act="shutdown">' + ICON.pc16 + "Shut Down...</button></div></div>");
      body.appendChild(menu);
      each(menu.querySelectorAll("a"), function (a) {
        a.addEventListener("click", function (e) {
          if (here(a.getAttribute("href")) && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); hideMenu(); if (minimized) restore(); }
        });
      });
      menu.querySelector("[data-act]").addEventListener("click", function () { hideMenu(); shutDown(); });
    }
    menu.hidden = false;
    startBtn.classList.add("on");
    startBtn.setAttribute("aria-expanded", "true");
  }
  function hideMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    startBtn.classList.remove("on");
    startBtn.setAttribute("aria-expanded", "false");
  }
  doc.addEventListener("mousedown", function (e) {
    clearTip();
    if (menu && !menu.hidden && !menu.contains(e.target) && !startBtn.contains(e.target)) hideMenu();
  });
  doc.addEventListener("keydown", function (e) { if ((e.key === "Escape" || e.key === "Esc") && menu && !menu.hidden) hideMenu(); });

  function desktopIcon(href, icon, label) { return '<button type="button" class="r95-icon" data-href="' + href + '">' + icon + "<span>" + label + "</span></button>"; }
  function showIcons(on) {
    if (!icons) {
      if (!on) return;
      icons = el('<div id="r95-icons" class="r95" hidden>' + desktopIcon("index.html", ICON.doc32, "Home Page") +
        desktopIcon("pubs.htm", ICON.folder32, "Publications") + desktopIcon(modernHref, ICON.globe32, "Back to 2026") + "</div>");
      body.appendChild(icons);
      each(icons.querySelectorAll(".r95-icon"), function (ic) {
        function open() { var h = ic.getAttribute("data-href"); if (here(h)) restore(); else location.href = h; }
        ic.addEventListener("click", function () { each(icons.querySelectorAll(".sel"), function (s) { s.classList.remove("sel"); }); ic.classList.add("sel"); });
        ic.addEventListener("dblclick", open);
        ic.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); open(); } });
        ic.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") open(); });
      });
    }
    icons.hidden = !on;
    if (!on) each(icons.querySelectorAll(".sel"), function (s) { s.classList.remove("sel"); });
  }

  /* ---------- the three title-bar buttons ---------- */
  function minimize() {
    if (busy || minimized) return;
    busy = true; hideMenu(); clearTip();
    ensureTaskbar();
    state.bar = true; save();
    var from = box(bar);
    html.classList.add("minimized");
    zoom(from, box(task)).then(function () {
      busy = false; minimized = true;
      task.classList.remove("on"); task.setAttribute("aria-pressed", "false");
      showIcons(true);
      if (!state.tipped && (!menu || menu.hidden)) { state.tipped = true; save(); tip(task, "Click here to bring the window back", true); }
    });
  }
  function restore() {
    if (busy || !minimized) return;
    busy = true; hideMenu(); clearTip(); showIcons(false);
    html.classList.remove("minimized");
    html.classList.add("r95-hide");
    zoom(box(task), box(bar)).then(function () {
      html.classList.remove("r95-hide");
      busy = false; minimized = false;
      task.classList.add("on"); task.setAttribute("aria-pressed", "true");
    });
  }
  function setMaxGlyph() {
    if (!maxBtn) return;
    var label = state.max ? "Restore" : "Maximize";
    maxBtn.querySelector("img").src = state.max ? "cap-restore.gif" : "cap-max.gif";
    maxBtn.title = label;
    maxBtn.setAttribute("aria-label", label);
  }
  function toggleMax() {
    if (busy || minimized) return;
    busy = true; clearTip();
    var from = box(bar);
    state.max = !state.max; save();
    html.classList.add("r95-hide");
    html.classList.toggle("max", state.max);
    setMaxGlyph();
    zoom(from, box(bar), 200).then(function () { html.classList.remove("r95-hide"); busy = false; });
  }
  function turnOff() {
    var off = el('<div id="r95-off"><div class="text"><div>It\'s now safe to turn off<br>your computer.</div></div></div>'), gone = false;
    body.appendChild(off);
    function leave() {
      if (gone) return;
      gone = true;
      var text = off.querySelector(".text");
      if (still || !text.animate) location.href = modernHref;
      else crtOff(text, function () { location.href = modernHref; });
    }
    off.addEventListener("click", leave);
    setTimeout(leave, 2600);
  }
  function shutDown() {
    if (doc.getElementById("r95-modal")) return;
    hideMenu(); clearTip();
    dialog("Shut Down", ICON.pc32, 'Are you sure you want to:' +
      '<label><input type="radio" name="r95-sd" value="off" checked> Shut down 1997 and go back to 2026?</label>' +
      '<label><input type="radio" name="r95-sd" value="restart"> Restart the old-school page?</label>', ["Yes", "No", "Help"],
      function (label, dlg) {
        if (label === "Help") { dialog("Help", ICON.info32, "Sorry, there is no help for nostalgia.", ["OK"], function () { shutDown(); }); return; }
        if (label !== "Yes") return;
        if (dlg.querySelector('input[value="restart"]').checked) { put(session, "aleix95-boot", "1"); location.reload(); return; }
        turnOff();
      });
  }
  if (minBtn) minBtn.addEventListener("click", minimize);
  if (maxBtn) maxBtn.addEventListener("click", toggleMax);
  if (closeBtn) closeBtn.addEventListener("click", shutDown);
  if (bar) bar.addEventListener("dblclick", function (e) { if (!caps || !caps.contains(e.target)) toggleMax(); });
  if (state.max) { html.classList.add("max"); setMaxGlyph(); }
  if (state.bar) ensureTaskbar();
  window.addEventListener("pageshow", function (e) {   /* coming back with the Back button */
    if (!e.persisted) return;
    rm(doc.getElementById("r95-off"));
    each(doc.querySelectorAll(".r95-beam"), rm);
  });

  /* ---------- boot screen ---------- */
  function boot(then) {
    var b = el('<div id="boot" aria-hidden="true"><div class="bios"><div class="logo"><b>&pi;</b>PI-READY</div><pre></pre>' +
      '<div class="hint">Press DEL to enter SETUP, any other key to skip</div></div></div>');
    var pre = b.querySelector("pre"), timers = [], over = false, out = [], i = 0;
    var lines = [
      '<span class="w">Aleix Modular BIOS v3.14</span>, An Energy Star Ally',
      "Copyright (C) 1997, Uppsala Personal Computers", "",
      "Pi-486 CPU at 314 MHz", "Memory Test :  @MEM@", "",
      "Detecting IDE Primary Master ... PI-DRIVE 3.14 GB",
      "Detecting IDE Primary Slave  ... None",
      "Detecting π .................. found (3.14159265)", "", "Booting from ~aleix ..."];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function finish() {
      if (over) return;
      over = true;
      timers.forEach(clearTimeout);
      doc.removeEventListener("keydown", onKey, true);
      html.classList.remove("booting");
      b.classList.add("out");
      setTimeout(function () { rm(b); if (then) then(); }, 360);
    }
    function onKey(e) { if (e.metaKey || e.ctrlKey || e.altKey) return; e.preventDefault(); finish(); }
    function memTest(line) {
      var t0 = null;
      function frame(now) {
        if (over) return;
        if (t0 === null) t0 = now;
        var t = Math.min(1, (now - t0) / 520);
        pre.innerHTML = out.concat([line.replace("@MEM@", Math.round(65536 * t) + "K" + (t >= 1 ? " OK" : ""))]).join("\n");
        if (t < 1) requestAnimationFrame(frame);
        else { out.push(line.replace("@MEM@", "65536K OK")); later(next, 105); }
      }
      requestAnimationFrame(frame);
    }
    function next() {
      if (over) return;
      if (i >= lines.length) { later(splash, 280); return; }
      var line = lines[i++];
      if (line.indexOf("@MEM@") >= 0) { memTest(line); return; }
      out.push(line);
      pre.innerHTML = out.join("\n");
      later(next, line ? 105 : 35);
    }
    function splash() {
      b.appendChild(el('<div class="splash"><div class="t">Aleix Nieto Juscafresa</div><div class="s">Home Page <b>95</b></div><div class="bar"></div></div>'));
      later(finish, 1400);
    }
    b.addEventListener("click", finish);
    doc.addEventListener("keydown", onKey, true);
    body.appendChild(b);
    later(next, 260);
  }
  if (html.classList.contains("booting")) {
    if (still) html.classList.remove("booting");
    else boot(function () { if (caps) tip(caps, "Try the _ □ × buttons"); });
  }
})();
