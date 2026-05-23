const PROFILE_KEYWORDS = [
  "full-time", "early career", "new graduate", "geothermal", "EGS", "enhanced geothermal",
  "reservoir engineering", "production analysis", "production optimization", "petroleum engineering",
  "subsurface analytics", "reservoir simulation", "Python", "machine learning", "CMG", "Petrel",
  "KAPPA", "EOR", "carbon storage", "CCS", "CCUS", "hydrogen", "renewable energy"
];

const ROLE_KEYWORDS = {
  geothermal: ["geothermal", "egs", "enhanced geothermal", "subsurface", "hydrothermal", "reservoir engineer"],
  petroleum: ["petroleum", "reservoir", "reservoir simulation", "well testing", "eor", "subsurface"],
  production: ["production engineer", "production analyst", "operations", "facilities", "gas", "field engineer"],
  data: ["data", "analytics", "machine learning", "python", "sql", "tableau", "power bi", "digital"],
  renewable: ["renewable", "energy transition", "carbon storage", "ccs", "hydrogen", "solar", "wind", "battery"]
};

const TARGET_COMPANIES = [
  { name: "Calpine", focus: "Geothermal operations, production analytics, power generation", url: "https://www.calpine.com/careers/" },
  { name: "Ormat Technologies", focus: "Geothermal development, power plants, reservoir and field operations", url: "https://www.ormat.com/en/company/careers/" },
  { name: "Fervo Energy", focus: "Enhanced geothermal systems, reservoir engineering, drilling, analytics", url: "https://fervoenergy.com/careers/" },
  { name: "Sage Geosystems", focus: "Geopressured geothermal and energy storage", url: "https://www.sagegeosystems.com/careers" },
  { name: "SLB", focus: "Reservoir engineering, geothermal, production, digital subsurface", url: "https://careers.slb.com/" },
  { name: "Baker Hughes", focus: "Energy technology, field engineering, geothermal-adjacent operations", url: "https://careers.bakerhughes.com/" },
  { name: "Chevron", focus: "Petroleum reservoir, production, carbon storage, new energies", url: "https://careers.chevron.com/" },
  { name: "ExxonMobil", focus: "Reservoir engineering, production, low-carbon solutions", url: "https://jobs.exxonmobil.com/" },
  { name: "Oxy", focus: "Reservoir/production engineering, CO₂ management, DAC/new energies", url: "https://www.oxy.com/careers/" },
  { name: "ConocoPhillips", focus: "Reservoir, production, operations and analytics", url: "https://careers.conocophillips.com/" }
];

let allJobs = [];
let savedState = JSON.parse(localStorage.getItem("energyJobRadarState") || "{}");
let metadata = {};

const el = (id) => document.getElementById(id);
const fmtDate = (value) => {
  if (!value) return "Unknown date";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
const daysAgo = (value) => {
  if (!value) return 9999;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 9999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
};
const isExpired = (job) => job.closing_date && new Date(job.closing_date) < new Date();
const normalize = (s = "") => s.toString().toLowerCase();

function summarize(text, max = 260) {
  const clean = (text || "No description provided by source.").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

function fallbackSearchUrl(job) {
  const query = encodeURIComponent(`${job.title || ""} ${job.company || ""} ${job.location || ""} job posting`.trim());
  return `https://www.google.com/search?q=${query}`;
}

function isDirectJobUrl(job) {
  const url = (job.url || job.apply_url || job.source_url || "").trim();
  return Boolean(url && url !== "#" && /^https?:\/\//i.test(url) && job.direct_url !== false && job.link_type !== "search");
}

function jobUrl(job) {
  const url = (job.url || job.apply_url || job.source_url || "").trim();
  if (url && url !== "#" && /^https?:\/\//i.test(url)) return url;
  return fallbackSearchUrl(job);
}

function jobLinkLabel(job) {
  return isDirectJobUrl(job) ? "Apply / View posting" : "Search this posting";
}

function computeRoleFamily(job) {
  const text = normalize(`${job.title} ${job.description} ${job.category || ""}`);
  const scores = Object.entries(ROLE_KEYWORDS).map(([family, words]) => [
    family,
    words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0)
  ]).sort((a, b) => b[1] - a[1]);
  return scores[0][1] > 0 ? scores[0][0] : "other";
}

function matchReasons(job) {
  const text = normalize(`${job.title} ${job.company} ${job.description} ${job.location}`);
  const reasons = [];
  PROFILE_KEYWORDS.forEach((keyword) => {
    if (text.includes(normalize(keyword))) reasons.push(keyword);
  });
  if (/new graduate|new grad|graduate engineer|entry|early career|associate|junior|phd|doctoral|research|full[- ]time|permanent/i.test(text)) reasons.push("full-time/early-career fit");
  if (/2027|may 2027|start date|available to start/i.test(text)) reasons.push("start-window signal");
  if (/remote|hybrid/i.test(text)) reasons.push("remote/hybrid");
  return [...new Set(reasons)].slice(0, 8);
}

function fitScore(job) {
  let score = 30;
  const reasons = matchReasons(job);
  score += reasons.length * 7;
  const text = normalize(`${job.title} ${job.description}`);
  if (/senior|principal|manager|director|lead/i.test(text)) score -= 14;
  if (/new graduate|new grad|graduate engineer|entry|early career|associate|junior|research engineer|phd|full[- ]time|permanent/i.test(text)) score += 12;
  if (/\bintern\b|\binternship\b|\bco[- ]?op\b|student trainee/i.test(text)) score -= 35;
  if (/geothermal|reservoir|production|subsurface|petroleum/i.test(text)) score += 10;
  const age = daysAgo(job.date_posted);
  if (age <= 7) score += 8;
  else if (age <= 30) score += 3;
  else if (age > 60) score -= 8;
  if (job.source === "USAJOBS") score += 2;
  return Math.max(0, Math.min(100, score));
}

function enrich(job) {
  const role_family = job.role_family || computeRoleFamily(job);
  const reasons = matchReasons(job);
  const score = job.fit_score ?? fitScore(job);
  return { ...job, role_family, match_reasons: reasons, fit_score: score };
}

async function loadJobs() {
  try {
    const response = await fetch("data/jobs.json", { cache: "no-store" });
    if (!response.ok) throw new Error("jobs.json missing");
    const payload = await response.json();
    metadata = payload.metadata || {};
    allJobs = (payload.jobs || []).map(enrich);
  } catch (error) {
    console.warn("Using built-in sample jobs because data/jobs.json could not be loaded.", error);
    metadata = { last_updated: new Date().toISOString(), mode: "sample" };
    allJobs = sampleJobs().map(enrich);
  }
  renderStaticContent();
  populateSources();
  render();
}

function renderStaticContent() {
  el("keywordCloud").innerHTML = PROFILE_KEYWORDS.map((k) => `<span class="pill pill--primary">${k}</span>`).join("");
  el("companyList").innerHTML = TARGET_COMPANIES.map((c) => `
    <li><a href="${c.url}" target="_blank" rel="noopener">${c.name}</a><small>${c.focus}</small></li>
  `).join("");
  el("lastUpdated").textContent = `Last updated: ${fmtDate(metadata.last_updated)}${metadata.mode === "sample" ? " (sample data)" : ""}`;
}

function populateSources() {
  const select = el("sourceFilter");
  const sources = [...new Set(allJobs.map((j) => j.source).filter(Boolean))].sort();
  sources.forEach((source) => {
    const opt = document.createElement("option");
    opt.value = source;
    opt.textContent = source;
    select.appendChild(opt);
  });
}

function getFilters() {
  return {
    search: normalize(el("searchInput").value),
    role: el("roleFilter").value,
    location: normalize(el("locationFilter").value),
    source: el("sourceFilter").value,
    sort: el("sortFilter").value,
    remoteOnly: el("remoteOnly").checked,
    newOnly: el("newOnly").checked,
    savedOnly: el("savedOnly").checked,
    hideExpired: el("hideExpired").checked
  };
}

function filteredJobs() {
  const f = getFilters();
  let jobs = [...allJobs];
  if (f.search) {
    jobs = jobs.filter((job) => normalize(`${job.title} ${job.company} ${job.description} ${job.location} ${(job.match_reasons || []).join(" ")}`).includes(f.search));
  }
  if (f.role !== "all") jobs = jobs.filter((job) => job.role_family === f.role);
  if (f.location) jobs = jobs.filter((job) => normalize(job.location || "").includes(f.location));
  if (f.source !== "all") jobs = jobs.filter((job) => job.source === f.source);
  if (f.remoteOnly) jobs = jobs.filter((job) => /remote|hybrid/i.test(`${job.location} ${job.description}`));
  if (f.newOnly) jobs = jobs.filter((job) => daysAgo(job.date_posted) <= 7);
  if (f.savedOnly) jobs = jobs.filter((job) => savedState[job.id]?.saved);
  if (f.hideExpired) jobs = jobs.filter((job) => !isExpired(job));

  jobs.sort((a, b) => {
    if (f.sort === "fit") return b.fit_score - a.fit_score || new Date(b.date_posted || 0) - new Date(a.date_posted || 0);
    if (f.sort === "date") return new Date(b.date_posted || 0) - new Date(a.date_posted || 0);
    if (f.sort === "deadline") return new Date(a.closing_date || "2999-12-31") - new Date(b.closing_date || "2999-12-31");
    if (f.sort === "company") return (a.company || "").localeCompare(b.company || "");
    return 0;
  });
  return jobs;
}

function renderStats(jobs) {
  el("totalJobs").textContent = allJobs.length;
  el("newJobs").textContent = allJobs.filter((j) => daysAgo(j.date_posted) <= 7).length;
  el("highFitJobs").textContent = allJobs.filter((j) => j.fit_score >= 70).length;
  el("resultCount").textContent = `${jobs.length} result${jobs.length === 1 ? "" : "s"}`;
}

function render() {
  const jobs = filteredJobs();
  renderStats(jobs);
  const list = el("jobsList");
  el("emptyState").hidden = jobs.length > 0;
  list.innerHTML = jobs.map(renderJobCard).join("");
  bindJobButtons();
}

function renderJobCard(job) {
  const state = savedState[job.id] || {};
  const saved = state.saved;
  const status = state.status || "Not started";
  const scoreClass = job.fit_score >= 70 ? "pill--good" : job.fit_score >= 50 ? "pill--accent" : "";
  const href = jobUrl(job);
  const direct = isDirectJobUrl(job);
  return `
    <article class="job-card" data-job-id="${job.id}">
      <div class="job-card__top">
        <div>
          <h3 class="job-title"><a href="${href}" target="_blank" rel="noopener">${job.title}</a></h3>
          <p class="company">${job.company || "Unknown company"} • ${job.location || "Location not provided"}</p>
        </div>
        <div class="score" style="--score:${job.fit_score}" aria-label="Fit score ${job.fit_score}">${job.fit_score}</div>
      </div>
      <div class="job-meta">
        <span class="pill ${scoreClass}">${job.fit_score >= 70 ? "High fit" : job.fit_score >= 50 ? "Possible fit" : "Review"}</span>
        <span class="pill">${job.source || "Source unknown"}</span>
        <span class="pill ${direct ? "pill--good" : "pill--accent"}">${direct ? "Direct job link" : "Search fallback link"}</span>
        <span class="pill">Posted ${fmtDate(job.date_posted)}</span>
        ${job.closing_date ? `<span class="pill ${isExpired(job) ? "pill--bad" : ""}">Closes ${fmtDate(job.closing_date)}</span>` : ""}
        <span class="pill">${job.role_family}</span>
      </div>
      <p class="job-desc">${summarize(job.description)}</p>
      <div class="match-reasons">
        ${(job.match_reasons || []).map((r) => `<span class="tag">${r}</span>`).join("") || `<span class="tag">Needs manual review</span>`}
      </div>
      <div class="job-actions">
        <button class="save-btn ${saved ? "is-saved" : ""}" type="button" data-action="save">${saved ? "★ Saved" : "☆ Save"}</button>
        <select class="status-select" data-action="status" aria-label="Application status">
          ${["Not started", "Interested", "Applied", "Networking", "Interview", "Rejected", "Closed"].map((s) => `<option ${s === status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <a class="apply-link" href="${href}" target="_blank" rel="noopener">${jobLinkLabel(job)} ↗</a>
      </div>
    </article>
  `;
}

function bindJobButtons() {
  document.querySelectorAll("[data-action='save']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.closest(".job-card").dataset.jobId;
      savedState[id] = savedState[id] || {};
      savedState[id].saved = !savedState[id].saved;
      persistState();
      render();
    });
  });
  document.querySelectorAll("[data-action='status']").forEach((select) => {
    select.addEventListener("change", () => {
      const id = select.closest(".job-card").dataset.jobId;
      savedState[id] = savedState[id] || {};
      savedState[id].status = select.value;
      persistState();
    });
  });
}

function persistState() {
  localStorage.setItem("energyJobRadarState", JSON.stringify(savedState));
}

function exportCsv() {
  const rows = filteredJobs().map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    source: j.source,
    fit_score: j.fit_score,
    date_posted: j.date_posted,
    closing_date: j.closing_date || "",
    status: savedState[j.id]?.status || "Not started",
    saved: savedState[j.id]?.saved ? "yes" : "no",
    url: jobUrl(j)
  }));
  const header = Object.keys(rows[0] || { title: "", company: "", location: "", source: "", fit_score: "", date_posted: "", closing_date: "", status: "", saved: "", url: "" });
  const csv = [header.join(","), ...rows.map((row) => header.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `energy-job-radar-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function sampleJobs() {
  return [
    {
      id: "sample-geothermal-reservoir-engineer",
      title: "Geothermal Reservoir Engineer - Full-Time / Early Career",
      company: "Sample Geothermal Co.",
      location: "California, United States",
      source: "Sample",
      url: "https://www.google.com/search?q=Geothermal+Reservoir+Engineer+Full-Time+Early+Career+job+posting",
      direct_url: false,
      link_type: "search",
      date_posted: new Date().toISOString(),
      closing_date: "2027-05-01",
      description: "Support geothermal reservoir surveillance, injectivity analysis, production analytics, Python workflows, and field data interpretation for EGS and hydrothermal assets."
    },
    {
      id: "sample-production-analyst",
      title: "Petroleum Production Data Analyst",
      company: "Sample Energy Operator",
      location: "Houston, TX / Hybrid",
      source: "Sample",
      url: "https://www.google.com/search?q=Petroleum+Production+Data+Analyst+job+posting",
      direct_url: false,
      link_type: "search",
      date_posted: new Date(Date.now() - 3 * 86400000).toISOString(),
      description: "Analyze production trends, well performance, reservoir behavior, decline curves, and operational data using Python, SQL, Tableau, and petroleum engineering fundamentals."
    }
  ];
}

["searchInput", "roleFilter", "locationFilter", "sourceFilter", "sortFilter", "remoteOnly", "newOnly", "savedOnly", "hideExpired"].forEach((id) => {
  el(id).addEventListener("input", render);
  el(id).addEventListener("change", render);
});
el("exportCsvBtn").addEventListener("click", exportCsv);
loadJobs();
