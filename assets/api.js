window.MOTY_API = location.hostname.endsWith("github.io")
  ? "https://lukes-mac-mini.tail6b5c43.ts.net"
  : "";

window.motyFetch = async function (path, body) {
  const opts = body === undefined ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  let res;
  try {
    res = await fetch(window.MOTY_API + path, opts);
  } catch (e) {
    const err = new Error("offline");
    err.offline = true;
    throw err;
  }
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || "Request failed (" + res.status + ").");
  return data;
};

window.motyDays = function (cfg) {
  const out = [];
  const d = new Date(cfg.startDate + "T12:00:00");
  const end = new Date(cfg.endDate + "T12:00:00");
  while (d <= end) {
    out.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
    d.setDate(d.getDate() + 1);
  }
  return out;
};
window.motyDate = (iso) => new Date(iso + "T12:00:00");
window.motyCol = (d) => (d.getDay() + 6) % 7;
window.MOTY_DOW = ["M", "T", "W", "T", "F", "S", "S"];
