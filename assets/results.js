(function () {
  const $ = (s) => document.querySelector(s);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let D = null, sel = null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const label = (iso) => { const d = motyDate(iso); return WD[d.getDay()] + " " + MONTHS[d.getMonth()] + " " + d.getDate(); };
  const tlabel = (id) => (D.config.timeBlocks.find((t) => t.id === id) || { label: id }).label;

  async function load() {
    try {
      D = await motyFetch("/api/results");
      $("#amsg").textContent = "";
      $("#main").hidden = false;
      render();
    } catch (e) {
      $("#amsg").textContent = e.offline ? "The server is unavailable. Please try again later." : e.message;
    }
  }

  function dayStats(iso) {
    const s = { free: [], maybe: [], busy: [], times: {} };
    Object.entries(D.responses).forEach(([n, r]) => {
      const v = r.days[iso];
      if (!v) return s.busy.push(n);
      s[v.status].push(n + (v.times.length ? " (" + v.times.map(tlabel).join(", ").toLowerCase() + ")" : ""));
      v.times.forEach((t) => (s.times[t] = (s.times[t] || 0) + (v.status === "free" ? 1 : 0.5)));
    });
    s.score = s.free.length + 0.5 * s.maybe.length;
    return s;
  }

  function render() {
    const names = D.config.names;
    const resp = Object.keys(D.responses);
    const missing = names.filter((n) => !resp.includes(n));
    $("#nResp").textContent = resp.length + " / " + names.length;
    $("#nMissing").textContent = missing.length;
    $("#missing").textContent = missing.length ? "Outstanding: " + missing.join(", ") : "All responses received.";

    const days = motyDays(D.config).filter((d) => !D.config.blockedDays.includes(d));
    const ranked = days.map((d) => ({ d, s: dayStats(d) }))
      .filter((x) => x.s.score > 0)
      .sort((a, b) => b.s.free.length - a.s.free.length || b.s.maybe.length - a.s.maybe.length || a.d.localeCompare(b.d))
      .slice(0, 5);
    $("#rank").innerHTML = ranked.length ? ranked.map((x) => {
      const best = Object.entries(x.s.times).sort((a, b) => b[1] - a[1])[0];
      return "<li><b>" + label(x.d) + "</b>: " + x.s.free.length + " free, " + x.s.maybe.length + " if needed" +
        (best ? ' <span class="small">/ ' + tlabel(best[0]) + "</span>" : "") + "</li>";
    }).join("") : '<li class="small">No responses.</li>';

    renderCal();
    renderAnswers();
    renderPeople();
    if (sel) showDay(sel);
  }

  function renderCal() {
    const cal = $("#cal");
    cal.innerHTML = "";
    const n = Math.max(1, Object.keys(D.responses).length);
    let month = null, grid = null;
    motyDays(D.config).forEach((iso) => {
      const d = motyDate(iso);
      if (d.getMonth() !== month) {
        month = d.getMonth();
        const m = document.createElement("div");
        m.className = "month";
        m.innerHTML = "<h3>" + LONG[month] + " " + d.getFullYear() + "</h3>";
        grid = document.createElement("div");
        grid.className = "grid";
        MOTY_DOW.forEach((l) => { const h = document.createElement("div"); h.className = "dow"; h.style.textAlign = "center"; h.style.paddingTop = "8px"; h.textContent = l; grid.appendChild(h); });
        for (let i = 0; i < motyCol(d); i++) { const p = document.createElement("div"); p.className = "day pad"; grid.appendChild(p); }
        m.appendChild(grid);
        cal.appendChild(m);
      }
      const b = document.createElement("button");
      const isBlocked = D.config.blockedDays.includes(iso);
      const s = dayStats(iso);
      const ratio = s.score / n;
      b.className = "day" + (isBlocked ? " blocked" : ratio > 0 ? " h" : "") + (sel === iso ? " sel" : "");
      if (!isBlocked && ratio > 0) b.style.background = "color-mix(in srgb, var(--free) " + Math.round(20 + 80 * ratio) + "%, var(--cell))";
      if (!isBlocked && ratio > 0 && ratio < 0.45) b.style.color = "var(--ink)";
      b.innerHTML = d.getDate() + (isBlocked ? "" : "<small>" + s.free.length + (s.maybe.length ? "+" + s.maybe.length : "") + "</small>");
      b.onclick = () => { sel = iso; renderCal(); showDay(iso); };
      grid.appendChild(b);
    });
  }

  function showDay(iso) {
    const s = dayStats(iso);
    const missing = D.config.names.filter((x) => !D.responses[x]);
    $("#detail").innerHTML = "<h4>" + label(iso) + "</h4>" +
      "<h4>Free (" + s.free.length + ")</h4><p>" + (esc(s.free.join(", ")) || "None") + "</p>" +
      "<h4>If needed (" + s.maybe.length + ")</h4><p>" + (esc(s.maybe.join(", ")) || "None") + "</p>" +
      "<h4>Busy (" + s.busy.length + ")</h4><p>" + (esc(s.busy.join(", ")) || "None") + "</p>" +
      (missing.length ? "<h4>No response (" + missing.length + ")</h4><p>" + esc(missing.join(", ")) + "</p>" : "");
  }

  function renderAnswers() {
    let html = "";
    D.config.questions.forEach((q) => {
      const got = Object.entries(D.responses).filter(([, r]) => r.answers[q.id]);
      html += '<div class="q"><div class="ql">' + esc(q.label) + '</div><div class="qn">' + got.length + " answered</div>";
      if (q.type === "choice" || q.type === "multi") {
        q.options.forEach((o) => {
          const who = got.filter(([, r]) => (q.type === "multi" ? r.answers[q.id].includes(o) : r.answers[q.id] === o)).map(([n]) => n);
          const pct = got.length ? Math.round((100 * who.length) / got.length) : 0;
          html += '<div class="barrow"><div class="t"><i style="width:' + pct + '%"></i><span>' + esc(o) +
            (who.length ? ' <span class="small">(' + esc(who.join(", ")) + ")</span>" : "") + "</span></div><b>" + who.length + "</b></div>";
        });
        if (q.average && got.length) {
          const nums = got.map(([, r]) => parseFloat(String(r.answers[q.id]).replace(/[^0-9.]/g, ""))).filter((x) => !isNaN(x));
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          html += '<div class="txt"><b>Average: $' + (Math.round(avg * 100) / 100) + "</b></div>";
        }
      } else if (q.type === "list") {
        const tally = {};
        got.forEach(([n, r]) => r.answers[q.id].forEach((g) => {
          const k = g.toLowerCase();
          tally[k] = tally[k] || { name: g, by: [] };
          tally[k].by.push(n);
        }));
        html += Object.values(tally).sort((x, y) => y.by.length - x.by.length || x.name.localeCompare(y.name))
          .map((t) => '<div class="txt"><b>' + esc(t.name) + "</b> " + t.by.length + ' <span class="small">(' + esc(t.by.join(", ")) + ")</span></div>").join("") || '<p class="small">No responses.</p>';
      } else {
        html += got.map(([n, r]) => '<div class="txt"><b>' + esc(n) + ":</b> " + esc(r.answers[q.id]) + "</div>").join("") || '<p class="small">No responses.</p>';
      }
      html += "</div>";
    });
    $("#answers").innerHTML = html;
  }

  function renderPeople() {
    const rows = Object.entries(D.responses).sort((a, b) => a[0].localeCompare(b[0])).map(([n, r]) => {
      const v = Object.values(r.days);
      return "<tr><td><b>" + esc(n) + '</b><br><span class="small">' + esc(r.updated.replace("T", " ")) + "</span></td><td>" +
        v.filter((x) => x.status === "free").length + " free<br>" + v.filter((x) => x.status === "maybe").length + " if needed</td></tr>";
    });
    $("#people").innerHTML = rows.join("") || '<tr><td class="small">No responses.</td></tr>';
  }

  function csv() {
    const days = motyDays(D.config);
    const qs = D.config.questions;
    const head = ["name", "updated"].concat(qs.map((q) => q.id), days);
    const lines = [head];
    Object.entries(D.responses).forEach(([n, r]) => {
      lines.push([n, r.updated].concat(qs.map((q) => { const v = r.answers[q.id]; return Array.isArray(v) ? v.join("; ") : v || ""; }),
        days.map((d) => (r.days[d] ? r.days[d].status + ":" + r.days[d].times.join("|") : ""))));
    });
    const text = lines.map((l) => l.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = "moty-2027-responses.csv";
    a.click();
  }

  $("#refresh").onclick = load;
  $("#csv").onclick = csv;
  load();
})();
