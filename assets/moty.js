(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const COL_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const S = {
    cfg: null, step: 0, name: null, brush: "free",
    days: {}, defTimes: [], answers: {},
  };

  const label = (iso) => { const d = motyDate(iso); return WD[d.getDay()] + " " + MONTHS[d.getMonth()] + " " + d.getDate(); };
  const blocked = (iso) => (S.cfg.blockedDays || []).includes(iso);
  const openDays = () => motyDays(S.cfg).filter((d) => !blocked(d));
  const effTimes = (iso) => S.days[iso].times || S.defTimes;
  const msg = (n, text, ok) => { const m = $("#msg" + n); m.textContent = text || ""; m.classList.toggle("ok", !!ok); };
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const statusName = (st) => (st === "free" ? "Free" : "If needed");

  function renderNames() {
    $("#names").innerHTML = "";
    S.cfg.names.forEach((n) => {
      const b = document.createElement("button");
      b.className = "pill" + (S.name === n ? " on" : "");
      b.textContent = n;
      b.onclick = () => { S.name = n; renderNames(); next(); };
      $("#names").appendChild(b);
    });
  }

  function renderCal() {
    const cal = $("#cal");
    cal.innerHTML = "";
    const groups = [];
    motyDays(S.cfg).forEach((iso) => {
      const d = motyDate(iso);
      const key = d.getFullYear() + "-" + d.getMonth();
      if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, d, days: [] });
      groups[groups.length - 1].days.push(iso);
    });
    groups.forEach((g) => {
      const m = document.createElement("div");
      m.className = "month";
      m.innerHTML = "<h3>" + LONG_MONTHS[g.d.getMonth()] + " " + g.d.getFullYear() + "</h3>";
      const grid = document.createElement("div");
      grid.className = "grid";
      MOTY_DOW.forEach((l, i) => {
        const b = document.createElement("button");
        b.className = "dow";
        b.textContent = l;
        b.setAttribute("aria-label", "Apply to every " + COL_NAMES[i]);
        b.onclick = () => paint(openDays().filter((x) => motyCol(motyDate(x)) === i), true);
        grid.appendChild(b);
      });
      for (let i = 0; i < motyCol(motyDate(g.days[0])); i++) {
        const p = document.createElement("div"); p.className = "day pad"; grid.appendChild(p);
      }
      g.days.forEach((iso) => {
        const b = document.createElement("button");
        const st = S.days[iso] && S.days[iso].status;
        b.className = "day" + (blocked(iso) ? " blocked" : st ? " " + st : "");
        b.textContent = motyDate(iso).getDate();
        b.setAttribute("aria-label", label(iso) + ", " + (blocked(iso) ? "unavailable" : st ? statusName(st) : "busy"));
        if (blocked(iso)) b.disabled = true;
        else b.onclick = () => paint([iso], false);
        grid.appendChild(b);
      });
      m.appendChild(grid);
      cal.appendChild(m);
    });
    const vals = Object.values(S.days);
    const f = vals.filter((v) => v.status === "free").length;
    const mb = vals.filter((v) => v.status === "maybe").length;
    $("#dayCount").textContent = f + mb ? f + " free, " + mb + " if needed" : "No dates selected.";
  }

  function paint(list, force) {
    list.forEach((iso) => {
      if (blocked(iso)) return;
      const cur = S.days[iso] && S.days[iso].status;
      if (S.brush === "busy" || (!force && cur === S.brush)) delete S.days[iso];
      else S.days[iso] = { status: S.brush, times: S.days[iso] ? S.days[iso].times : null };
    });
    msg(1, "");
    renderCal();
  }

  function quick(kind) {
    const days = openDays();
    const isWeekend = (iso) => [0, 5, 6].includes(motyDate(iso).getDay());
    if (kind === "clear") S.days = {};
    else if (kind === "all") days.forEach((d) => (S.days[d] = { status: "free", times: null }));
    else {
      S.days = {};
      days.filter((d) => (kind === "weekend" ? isWeekend(d) : !isWeekend(d)))
        .forEach((d) => (S.days[d] = { status: "free", times: null }));
    }
    renderCal();
  }

  function renderTimes() {
    const def = $("#defTimes");
    def.innerHTML = "";
    S.cfg.timeBlocks.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tb" + (S.defTimes.includes(t.id) ? " on" : "");
      b.innerHTML = esc(t.label) + "<small>" + esc(t.hint) + "</small>";
      b.onclick = () => { S.defTimes = toggle(S.defTimes, t.id); msg(2, ""); renderTimes(); };
      def.appendChild(b);
    });
    const list = $("#dayList");
    list.innerHTML = "";
    Object.keys(S.days).sort().forEach((iso) => {
      const row = document.createElement("div");
      row.className = "dayrow";
      const st = S.days[iso].status;
      row.innerHTML = '<div class="d"><i class="' + st + '" title="' + statusName(st) + '"></i>' + label(iso) + "</div>";
      const mini = document.createElement("div");
      const eff = effTimes(iso);
      mini.className = "mini" + (eff.length ? "" : " bad");
      S.cfg.timeBlocks.forEach((t) => {
        const b = document.createElement("button");
        b.className = eff.includes(t.id) ? "on" : "";
        b.textContent = t.label;
        b.onclick = () => { S.days[iso].times = toggle(effTimes(iso), t.id); msg(2, ""); renderTimes(); };
        mini.appendChild(b);
      });
      row.appendChild(mini);
      list.appendChild(row);
    });
  }

  function visible(q) {
    if (!q.showIf) return true;
    return Object.entries(q.showIf).every(([k, vals]) => vals.includes(S.answers[k]));
  }

  function renderQs() {
    const box = $("#qs");
    box.innerHTML = "";
    S.cfg.questions.filter(visible).forEach((q, i) => {
      const w = document.createElement("div");
      w.className = "q";
      w.innerHTML = '<div class="ql">' + (i + 1) + ". " + esc(q.label) + (q.required ? ' <span class="req">*</span>' : "") + "</div>" +
        (q.note ? '<div class="qn">' + esc(q.note) + "</div>" : "");
      if (q.type === "choice") {
        const o = document.createElement("div");
        o.className = "opts" + (q.options.every((x) => x.length <= 9) ? " row" : "");
        q.options.forEach((opt) => {
          const b = document.createElement("button");
          b.className = "opt" + (S.answers[q.id] === opt ? " on" : "");
          b.textContent = opt;
          b.onclick = () => {
            S.answers[q.id] = S.answers[q.id] === opt ? "" : opt;
            msg(3, "");
            renderQs();
          };
          o.appendChild(b);
        });
        w.appendChild(o);
      } else {
        const el = document.createElement(q.type === "textarea" ? "textarea" : "input");
        if (q.type !== "textarea") el.type = "text";
        el.placeholder = q.placeholder || "";
        el.value = S.answers[q.id] || "";
        el.maxLength = 1000;
        el.oninput = () => (S.answers[q.id] = el.value);
        w.appendChild(el);
      }
      box.appendChild(w);
    });
  }

  function renderReview() {
    const keys = Object.keys(S.days).sort();
    const fmt = (iso) => label(iso) + ", " + effTimes(iso).map((t) => S.cfg.timeBlocks.find((b) => b.id === t).label.toLowerCase()).join(", ");
    const free = keys.filter((k) => S.days[k].status === "free").map(fmt);
    const maybe = keys.filter((k) => S.days[k].status === "maybe").map(fmt);
    let html = "<dt>Name</dt><dd>" + esc(S.name) + "</dd>" +
      "<dt>Free (" + free.length + ")</dt><dd>" + (free.join("<br>") || "None") + "</dd>" +
      "<dt>If needed (" + maybe.length + ")</dt><dd>" + (maybe.join("<br>") || "None") + "</dd>";
    S.cfg.questions.filter(visible).forEach((q) => {
      html += "<dt>" + esc(q.label) + "</dt><dd>" + (S.answers[q.id] ? esc(S.answers[q.id]) : "<span class='small'>No answer</span>") + "</dd>";
    });
    $("#review").innerHTML = html;
  }

  function go(step) {
    S.step = step;
    $$("section[data-step]").forEach((s) => (s.hidden = +s.dataset.step !== step));
    $$("#steps span").forEach((s, i) => s.classList.toggle("on", i <= step));
    $("#steps").hidden = step === 5;
    $("#bar").hidden = step === 5;
    $("#back").hidden = step === 0;
    $("#next").textContent = step === 4 ? "Submit" : "Continue";
    $("#who").textContent = S.name && step > 0 ? S.name : "";
    if (step === 1) renderCal();
    if (step === 2) renderTimes();
    if (step === 3) renderQs();
    if (step === 4) renderReview();
    window.scrollTo(0, 0);
  }

  async function next() {
    const btn = $("#next");
    if (S.step === 0) {
      if (!S.name) return msg(0, "Select your name.");
      btn.disabled = true;
      try {
        const r = await motyFetch("/api/login", { name: S.name });
        S.days = {};
        S.defTimes = [];
        S.answers = {};
        if (r.exists) {
          const counts = {};
          Object.entries(r.days).forEach(([d, v]) => {
            if (blocked(d)) return;
            S.days[d] = { status: v.status, times: v.times };
            const k = v.times.join(",");
            counts[k] = (counts[k] || 0) + 1;
          });
          const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          S.defTimes = common ? common[0].split(",").filter(Boolean) : [];
          Object.values(S.days).forEach((v) => { if (v.times.join(",") === S.defTimes.join(",")) v.times = null; });
          S.answers = r.answers || {};
        }
        msg(0, "");
        go(1);
      } catch (e) {
        msg(0, e.offline ? "The server is unavailable. Please try again later." : e.message);
      } finally { btn.disabled = false; }
      return;
    }
    if (S.step === 1) {
      if (!Object.keys(S.days).length) return msg(1, "Select at least one date.");
      return go(2);
    }
    if (S.step === 2) {
      const missing = Object.keys(S.days).filter((d) => !effTimes(d).length);
      if (missing.length) return msg(2, S.defTimes.length ? "Select a time for " + label(missing[0]) + "." : "Select a default time.");
      return go(3);
    }
    if (S.step === 3) {
      const miss = S.cfg.questions.filter(visible).find((q) => q.required && !S.answers[q.id]);
      if (miss) return msg(3, "Required: " + miss.label);
      return go(4);
    }
    if (S.step === 4) {
      btn.disabled = true;
      const days = {};
      Object.keys(S.days).forEach((d) => (days[d] = { status: S.days[d].status, times: effTimes(d) }));
      const answers = {};
      S.cfg.questions.filter(visible).forEach((q) => { if (S.answers[q.id]) answers[q.id] = S.answers[q.id]; });
      try {
        await motyFetch("/api/submit", { name: S.name, days, answers });
        go(5);
      } catch (e) {
        msg(4, e.offline ? "The server is unavailable. Your answers are kept on this page; try again shortly." : e.message);
      } finally { btn.disabled = false; }
    }
  }

  async function boot() {
    $("#next").onclick = next;
    $("#back").onclick = () => go(Math.max(0, S.step - 1));
    $("#editAgain").onclick = () => go(1);
    $$("#brush button").forEach((b) => (b.onclick = () => {
      S.brush = b.dataset.v;
      $$("#brush button").forEach((x) => x.classList.toggle("on", x === b));
    }));
    $$("[data-quick]").forEach((b) => (b.onclick = () => quick(b.dataset.quick)));
    try {
      S.cfg = await motyFetch("/api/config");
    } catch (e) {
      $("#offline").hidden = false;
      $("#next").disabled = true;
      return;
    }
    renderNames();
    go(0);
  }
  boot();
})();
