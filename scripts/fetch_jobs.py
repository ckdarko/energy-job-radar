"""Fetch job postings for Energy Job Radar.

Expanded sources supported:
- Adzuna Jobs API (requires ADZUNA_APP_ID and ADZUNA_APP_KEY)
- USAJOBS API (requires USAJOBS_EMAIL and USAJOBS_API_KEY)
- Greenhouse Job Board API (public GET endpoints; no key required)
- Lever Postings API (public postings endpoint; no key required)
- Remotive public remote-jobs API (no key required)
- Arbeitnow public jobs API (no key required)

The script is designed for GitHub Actions. It writes data/jobs.json, which the static web app reads.
"""
from __future__ import annotations

import hashlib
import html
import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlencode

import requests

ROOT = Path(__file__).resolve().parents[1]
PROFILE_PATH = ROOT / "config" / "profile.json"
SOURCE_TARGETS_PATH = ROOT / "config" / "source_targets.json"
WATCHLIST_PATH = ROOT / "config" / "company_watchlist.json"
GEOTHERMAL_WATCHLIST_PATH = ROOT / "config" / "geothermal_company_watchlist.json"
OUTPUT_PATH = ROOT / "data" / "jobs.json"

USER_AGENT = "EnergyJobRadar/2.0 (+https://github.com/)"
REQUEST_TIMEOUT = 25


class FetchStats:
    def __init__(self) -> None:
        self.errors: List[str] = []
        self.attempted_sources: List[str] = []
        self.source_counts: Dict[str, int] = {}

    def log_source(self, source: str, count: int) -> None:
        self.attempted_sources.append(source)
        self.source_counts[source] = self.source_counts.get(source, 0) + count

    def log_error(self, message: str) -> None:
        print(message, file=sys.stderr)
        self.errors.append(message[:400])


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_profile() -> Dict[str, Any]:
    return load_json(PROFILE_PATH, {})


def _merge_unique_items(base: Dict[str, Any], extra: Dict[str, Any], key: str, identity_field: str) -> None:
    """Merge source-target lists without duplicating companies/ATS tokens."""
    existing = {str(item.get(identity_field, item.get("name", item.get("company", "")))).lower().strip()
                for item in base.get(key, []) if isinstance(item, dict)}
    for item in extra.get(key, []) if isinstance(extra, dict) else []:
        if not isinstance(item, dict):
            continue
        identity = str(item.get(identity_field, item.get("name", item.get("company", "")))).lower().strip()
        if identity and identity not in existing:
            base.setdefault(key, []).append(item)
            existing.add(identity)


def load_source_targets() -> Dict[str, Any]:
    targets = load_json(SOURCE_TARGETS_PATH, {"greenhouse_boards": [], "lever_sites": [], "company_search_fallbacks": []})
    geothermal = load_json(GEOTHERMAL_WATCHLIST_PATH, {})
    if isinstance(geothermal, dict):
        _merge_unique_items(targets, geothermal, "greenhouse_boards", "board")
        _merge_unique_items(targets, geothermal, "lever_sites", "site")
        _merge_unique_items(targets, geothermal, "company_search_fallbacks", "name")
        if geothermal.get("notes"):
            targets["geothermal_watchlist_notes"] = geothermal.get("notes")
    return targets


def env(name: str) -> str:
    return os.getenv(name, "").strip()


def clean_html(value: Any) -> str:
    if not value:
        return ""
    value = html.unescape(str(value))
    value = re.sub(r"<script[^>]*>.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def text_from_mixed(value: Any) -> str:
    """Safely extract text from API fields that may be strings, dicts, or lists.

    Some job APIs, especially Lever boards, do not return identical JSON shapes
    for every company. A field that is usually {"text": "..."} can sometimes
    be a plain string or a nested list. This helper prevents one unusual posting
    from stopping the entire scheduled update.
    """
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        parts = []
        for key in ("text", "content", "description", "value"):
            if key in value:
                parts.append(text_from_mixed(value.get(key)))
        # If none of the expected keys exist, keep scalar values rather than dumping JSON.
        if not parts:
            for v in value.values():
                if isinstance(v, (str, int, float)):
                    parts.append(str(v))
        return " ".join(p for p in parts if p)
    if isinstance(value, list):
        return " ".join(text_from_mixed(v) for v in value if v is not None)
    return str(value)


def stable_id(*parts: Any) -> str:
    raw = "|".join(str(p or "").lower().strip() for p in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def parse_date(value: Optional[Any]) -> Optional[str]:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        # Lever timestamps are milliseconds since epoch.
        try:
            if value > 10_000_000_000:
                value = value / 1000
            return datetime.fromtimestamp(value, tz=timezone.utc).date().isoformat()
        except Exception:
            return None
    value = str(value).strip()
    if not value:
        return None
    # Keep date-only values date-only. ISO timestamps work in the browser too.
    return value[:10] if re.match(r"^\d{4}-\d{2}-\d{2}", value) else value



def date_to_day(value: Optional[Any]) -> Optional[datetime]:
    """Parse a date/date-time value into a UTC datetime for recency filtering."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        try:
            if value > 10_000_000_000:
                value = value / 1000
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except Exception:
            return None
    text = str(value).strip()
    if not text:
        return None
    text = text.replace("Z", "+00:00")
    # Date-only strings are treated as midnight UTC.
    if re.match(r"^\d{4}-\d{2}-\d{2}$", text):
        try:
            return datetime.fromisoformat(text).replace(tzinfo=timezone.utc)
        except Exception:
            return None
    try:
        dt = datetime.fromisoformat(text)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass
    # Last fallback for values like 2026-05-26T12:34:56.000+0000
    m = re.match(r"^(\d{4}-\d{2}-\d{2})", text)
    if m:
        try:
            return datetime.fromisoformat(m.group(1)).replace(tzinfo=timezone.utc)
        except Exception:
            return None
    return None


def is_recent_job(job: Dict[str, Any], profile: Dict[str, Any]) -> bool:
    """Keep recent postings only. Watchlist links are not postings, so keep them.

    Default behavior removes anything posted before 2026-01-01 and anything older than
    max_job_age_days. This prevents stale 2025 postings from appearing in the dashboard.
    """
    if job.get("is_watchlist_item"):
        return True
    posted = date_to_day(job.get("date_posted"))
    if posted is None:
        # Real postings without dates are usually unreliable/stale for this dashboard.
        return bool(profile.get("include_undated_jobs", False))
    min_date_text = profile.get("min_posted_date")
    if min_date_text:
        min_date = date_to_day(min_date_text)
        if min_date and posted < min_date:
            return False
    max_age = int(profile.get("max_job_age_days", 120))
    if max_age > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age)
        if posted < cutoff:
            return False
    return True

def is_http_url(value: Optional[Any]) -> bool:
    if not value:
        return False
    return str(value).strip().lower().startswith(("http://", "https://"))


def fallback_job_search_url(job: Dict[str, Any]) -> str:
    """Create a safe fallback link when a source does not provide a direct posting URL."""
    query = " ".join(
        str(job.get(field, "")).strip()
        for field in ("title", "company", "location")
        if str(job.get(field, "")).strip()
    )
    query = f"{query} job posting United States".strip() or "energy job posting United States"
    return "https://www.google.com/search?" + urlencode({"q": query})


def ensure_job_url(job: Dict[str, Any]) -> Dict[str, Any]:
    """Guarantee every job has a clickable URL and mark whether it is direct."""
    if job.get("link_type") == "search" or job.get("direct_url") is False:
        if not is_http_url(job.get("url")):
            job["url"] = fallback_job_search_url(job)
        job["direct_url"] = False
        job["link_type"] = "search"
        return job

    candidates = [
        job.get("url"),
        job.get("apply_url"),
        job.get("source_url"),
        job.get("redirect_url"),
        job.get("position_uri"),
    ]
    direct_url = next((str(u).strip() for u in candidates if is_http_url(u)), "")
    if direct_url:
        job["url"] = direct_url
        job["apply_url"] = job.get("apply_url") or direct_url
        job["source_url"] = job.get("source_url") or direct_url
        job["direct_url"] = True
        job["link_type"] = "direct"
    else:
        job["url"] = fallback_job_search_url(job)
        job["direct_url"] = False
        job["link_type"] = "search"
    return job


def contains_keyword(text: str, keyword: str) -> bool:
    kw = keyword.lower().strip()
    if not kw:
        return False
    # Short acronyms such as EGS, CCS, CMG should still match as full words.
    if len(kw) <= 4 or " " in kw:
        return bool(re.search(r"\b" + re.escape(kw).replace(r"\ ", r"\s+") + r"\b", text))
    return kw in text


def keyword_hits(text: str, keywords: Iterable[str]) -> List[str]:
    text = text.lower()
    return [kw for kw in keywords if contains_keyword(text, kw)]



def regex_hits(text: str, patterns: Iterable[str]) -> List[str]:
    """Return regex patterns that match text, ignoring invalid patterns."""
    hits: List[str] = []
    for pattern in patterns or []:
        try:
            if re.search(str(pattern), text or "", flags=re.I):
                hits.append(str(pattern))
        except re.error:
            continue
    return hits


def job_search_text(job: Dict[str, Any]) -> str:
    return f"{job.get('title','')} {job.get('company','')} {job.get('description','')} {job.get('location','')} {job.get('query','')}".lower()


def job_title_text(job: Dict[str, Any]) -> str:
    return str(job.get("title", "") or "").lower()


def cv_relevance_signals(job: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate whether a posting is close to Caleb's CV/resume.

    The gate is intentionally stricter than ordinary keyword matching. A posting must connect to
    petroleum/reservoir/production/geothermal/subsurface/CCUS/hydrogen-storage work, or be an energy-data
    role explicitly tied to those domains. This removes generic software, IT, civil/electrical, technician,
    operator, purchasing, and manufacturing roles that happen to mention energy.
    """
    if job.get("is_watchlist_item"):
        return {"passes": True, "reasons": ["company watchlist link"]}

    title = job_title_text(job)
    text = job_search_text(job)
    title_and_query = f"{title} {str(job.get('query','')).lower()}"

    excluded_title_hits = regex_hits(title, profile.get("hard_excluded_title_patterns", []))
    if excluded_title_hits:
        return {"passes": False, "reasons": ["excluded title pattern"] + excluded_title_hits[:3]}

    domain_hits = keyword_hits(text, profile.get("cv_core_domain_keywords", []))
    title_keyword_hits = keyword_hits(title_and_query, profile.get("cv_target_title_keywords", []))
    skill_hits = keyword_hits(text, profile.get("cv_skill_keywords", []))
    method_hits = keyword_hits(text, profile.get("cv_method_keywords", []))
    relevant_title_hits = regex_hits(title_and_query, profile.get("cv_relevant_title_patterns", []))

    # Generic technology/data roles are only relevant when the posting is explicitly about energy/subsurface work.
    generic_tech_title = bool(re.search(r"\b(software|embedded|firmware|validation|analytics engineer|IT|cloud|platform|systems design|systems architect)\b", title, flags=re.I))
    if generic_tech_title and not keyword_hits(text, ["geothermal", "reservoir", "petroleum", "oil and gas", "subsurface", "production optimization", "carbon storage", "CCUS", "hydrogen storage"]):
        return {"passes": False, "reasons": ["generic tech/data role without subsurface or energy-domain signal"]}

    # Avoid generic energy roles that are far from the CV, such as battery/manufacturing/purchasing/technician roles.
    generic_energy_but_not_cv = bool(re.search(r"\b(battery|manufacturing|purchasing|procurement|supply chain|technician|operator|civil|electrical)\b", title, flags=re.I))
    if generic_energy_but_not_cv and not relevant_title_hits:
        return {"passes": False, "reasons": ["generic energy role outside CV/resume focus"]}

    passes = False
    if relevant_title_hits:
        passes = True
    elif title_keyword_hits:
        passes = True
    elif domain_hits and (skill_hits or method_hits):
        passes = True
    elif domain_hits and re.search(r"\b(engineer|analyst|scientist|modeler|modeller|researcher|specialist)\b", title, flags=re.I):
        passes = True
    elif re.search(r"\b(energy data analyst|energy data scientist|renewable energy analyst)\b", title, flags=re.I) and keyword_hits(text, ["geothermal", "oil and gas", "petroleum", "reservoir", "subsurface", "carbon storage", "CCUS", "hydrogen storage"]):
        passes = True

    reasons = []
    reasons.extend(title_keyword_hits[:4])
    reasons.extend(domain_hits[:5])
    reasons.extend(skill_hits[:4])
    reasons.extend(method_hits[:4])
    if relevant_title_hits:
        reasons.append("CV-matched title")
    return {"passes": passes, "reasons": list(dict.fromkeys(reasons))[:12]}


def passes_cv_relevance_gate(job: Dict[str, Any], profile: Dict[str, Any]) -> bool:
    return bool(cv_relevance_signals(job, profile).get("passes"))


def fit_score(job: Dict[str, Any], profile: Dict[str, Any]) -> int:
    text = job_search_text(job)
    title = job_title_text(job)
    score = 15

    signals = cv_relevance_signals(job, profile)
    if not signals.get("passes") and profile.get("strict_cv_matching", True) and not job.get("is_watchlist_item"):
        return 0

    positive_hits = keyword_hits(text, profile.get("positive_keywords", []))
    negative_hits = keyword_hits(text, profile.get("negative_keywords", []))
    domain_hits = keyword_hits(text, profile.get("cv_core_domain_keywords", []))
    title_keyword_hits = keyword_hits(title, profile.get("cv_target_title_keywords", []))
    skill_hits = keyword_hits(text, profile.get("cv_skill_keywords", []))
    method_hits = keyword_hits(text, profile.get("cv_method_keywords", []))
    relevant_title_hits = regex_hits(title, profile.get("cv_relevant_title_patterns", []))

    score += min(len(domain_hits) * 8, 42)
    score += min(len(title_keyword_hits) * 10, 30)
    score += min(len(relevant_title_hits) * 14, 28)
    score += min(len(skill_hits) * 4, 20)
    score += min(len(method_hits) * 4, 18)
    score += min(len(positive_hits) * 2, 16)
    score -= min(len(negative_hits) * 8, 45)

    if re.search(r"new graduate|new grad|graduate engineer|entry[ -]?level|early career|associate|junior|phd|research engineer|full[- ]time|permanent", text):
        score += 10
    if re.search(r"geothermal|reservoir|production|subsurface|petroleum|carbon storage|ccs|ccus|hydrogen storage", text):
        score += 10
    if re.search(r"python|machine learning|data scientist|data analyst|analytics|simulation|cmg|petrel|kappa|eclipse|tnavigator|matlab|tableau", text):
        score += 8
    if re.search(r"\b(renewable energy analyst|energy transition analyst)\b", title) and re.search(r"geothermal|reservoir|subsurface|petroleum|oil and gas|carbon storage|ccs|ccus|hydrogen storage", text):
        score += 18
    if re.search(r"\b(senior|lead|principal|staff|manager|director|vp|vice president)\b", title) and not re.search(r"\b(junior|associate|early career|new graduate|graduate)\b", title):
        score -= 12

    # Penalize broad roles the user explicitly identified as irrelevant, even when the description mentions energy.
    if regex_hits(title, profile.get("hard_excluded_title_patterns", [])):
        score -= 100

    return max(0, min(100, score))



US_STATE_NAMES = {
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware",
    "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky",
    "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
    "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico",
    "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
    "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont",
    "virginia", "washington", "west virginia", "wisconsin", "wyoming", "district of columbia"
}

US_STATE_ABBREVIATIONS = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
}

US_CITY_HINTS = {
    "houston", "midland", "dallas", "austin", "san antonio", "tulsa", "oklahoma city", "denver",
    "bakersfield", "reno", "salt lake city", "golden", "oakland", "pittsburgh", "new orleans",
    "lafayette", "anchorage", "imperial valley", "salton sea", "the geysers", "milford"
}

NON_US_LOCATION_PATTERNS = [
    # Canada and Canadian province/city indicators
    r"\bcanada\b", r"\bcalgary\b", r"\bedmonton\b", r"\balberta\b", r"\bvancouver\b",
    r"\bbritish columbia\b", r"\btoronto\b", r"\bontario\b", r"\bottawa\b", r"\bmontreal\b",
    r"\bquébec\b", r"\bquebec\b", r"\bsaskatchewan\b", r"\bmanitoba\b", r"\bwinnipeg\b",
    r"\bnova scotia\b", r"\bnew brunswick\b", r"\bnewfoundland\b", r"\blabrador\b",
    # Common non-US/global location signals that should not appear in a US-only dashboard
    r"\bworldwide\b", r"\bglobal\b", r"\binternational\b", r"\beurope\b", r"\buk\b", r"\bunited kingdom\b",
    r"\bgermany\b", r"\bfrance\b", r"\bnetherlands\b", r"\baustralia\b", r"\bindia\b", r"\brazil\b", r"\bmexico\b",
]

US_ONLY_SOURCES = {"USAJOBS", "Adzuna"}


def has_us_location_signal(text: str) -> bool:
    """Return True when a location string clearly points to the United States."""
    raw = text or ""
    lower = raw.lower()
    if re.search(r"\b(united states|usa|u\.s\.|u\.s\.a\.|us only|usa only|remote[- ]?us|remote[- ]?usa)\b", lower):
        return True
    if any(state in lower for state in US_STATE_NAMES):
        return True
    if any(city in lower for city in US_CITY_HINTS):
        return True
    # Match city/state patterns such as Houston, TX or Golden, CO.
    for abbr in US_STATE_ABBREVIATIONS:
        if re.search(r"(?:,|\b)\s*" + re.escape(abbr) + r"\b", raw):
            return True
    return False


def has_non_us_location_signal(text: str) -> bool:
    """Return True when a job location/description clearly points outside the United States."""
    lower = (text or "").lower()
    return any(re.search(pattern, lower) for pattern in NON_US_LOCATION_PATTERNS)


def is_us_based_job(job: Dict[str, Any], profile: Dict[str, Any]) -> bool:
    """Keep only United States postings when profile.us_only is enabled.

    The filter is deliberately strict: if a job says Canada, Worldwide, Global, Europe, etc., it is removed.
    Remote roles are kept only when they say U.S./USA/United States or come from a U.S.-scoped source/company feed
    without any non-U.S. signal.
    """
    if not profile.get("us_only", True):
        return True

    if job.get("is_watchlist_item"):
        # These are company watch links, not individual postings. Keep them so the user can check U.S. career pages.
        return True

    location = str(job.get("location") or "")
    title = str(job.get("title") or "")
    company = str(job.get("company") or "")
    description = str(job.get("description") or "")
    query = str(job.get("query") or "")
    source = str(job.get("source") or "")
    location_text = f"{location} {title} {company} {query}"
    full_text = f"{location_text} {description[:1200]}"

    if has_non_us_location_signal(full_text):
        return False

    if has_us_location_signal(location_text):
        return True

    # USAJOBS and Adzuna are already queried through U.S. endpoints/locations, so keep unspecified/remote roles
    # unless a non-U.S. signal was found above.
    if any(source.startswith(src) for src in US_ONLY_SOURCES):
        return True

    # For public ATS feeds, keep plain "Remote" only if the source target was intentionally included as a U.S. company.
    if re.fullmatch(r"\s*(remote|remote / hybrid|hybrid|not listed|location not provided)\s*", location, flags=re.I):
        return bool(profile.get("keep_unspecified_remote_from_target_companies", True))

    return False


def is_excluded_job(job: Dict[str, Any], profile: Dict[str, Any]) -> bool:
    """Hard-filter internships and roles that are outside the user's CV/resume focus."""
    text = job_search_text(job)
    title = job_title_text(job)
    patterns = [
        r"\bintern\b",
        r"\binternship\b",
        r"\bsummer intern\b",
        r"\bsummer internship\b",
        r"\bco[- ]?op\b",
        r"\bcoop\b",
        r"\bstudent trainee\b",
        r"\bstudent assistant\b",
    ]
    if any(re.search(pattern, text) for pattern in patterns):
        return True
    if regex_hits(title, profile.get("hard_excluded_title_patterns", [])):
        return True
    for keyword in profile.get("excluded_keywords", []):
        if contains_keyword(text, keyword):
            return True
    return False


def role_family(job: Dict[str, Any]) -> str:
    text = f"{job.get('title','')} {job.get('description','')} {job.get('query','')}".lower()
    families = {
        "geothermal": ["geothermal", "egs", "enhanced geothermal", "hydrothermal", "superhot geothermal", "closed-loop geothermal"],
        "petroleum": ["petroleum", "reservoir", "well testing", "pressure transient", "eor", "subsurface", "oil and gas", "upstream"],
        "production": ["production engineer", "production analyst", "production data analyst", "production optimization", "production surveillance", "well performance", "digital oilfield"],
        "data": ["subsurface data", "petroleum data", "geothermal data", "reservoir data", "production data", "python", "machine learning", "tableau", "cmg", "petrel"],
        "renewable": ["carbon storage", "ccs", "ccus", "co2 storage", "hydrogen storage", "renewable energy analyst", "energy transition", "geothermal"],
    }
    best = ("other", 0)
    for family, words in families.items():
        count = sum(1 for word in words if word in text)
        if count > best[1]:
            best = (family, count)
    return best[0]


def requests_session() -> requests.Session:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json, text/plain, */*"})
    return session


def limited(items: List[Any], n: int) -> List[Any]:
    return items[: max(0, int(n or len(items)))]


def fetch_adzuna(profile: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "Adzuna"
    app_id = env("ADZUNA_APP_ID")
    app_key = env("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        print("Skipping Adzuna: ADZUNA_APP_ID or ADZUNA_APP_KEY not set.")
        return []

    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    queries = limited(profile.get("queries", []), profile.get("max_adzuna_queries", 35))
    locations = ["United States", "Texas", "California", "Colorado", "Oklahoma", "Remote"]
    for query in queries:
        for location in locations:
            params = {
                "app_id": app_id,
                "app_key": app_key,
                "results_per_page": 20,
                "what": query,
                "where": location,
                "sort_by": "date",
                "content-type": "application/json",
                "max_days_old": int(profile.get("max_job_age_days", 120)),
            }
            try:
                r = session.get("https://api.adzuna.com/v1/api/jobs/us/search/1", params=params, timeout=REQUEST_TIMEOUT)
                r.raise_for_status()
                payload = r.json()
            except Exception as exc:  # noqa: BLE001
                stats.log_error(f"Adzuna request failed for {query!r} / {location!r}: {exc}")
                continue

            for item in payload.get("results", []):
                title = item.get("title") or "Untitled role"
                company = (item.get("company") or {}).get("display_name") or "Unknown company"
                url = item.get("redirect_url") or item.get("adref") or ""
                job = {
                    "id": stable_id("adzuna", title, company, url),
                    "title": title,
                    "company": company,
                    "location": (item.get("location") or {}).get("display_name") or location,
                    "source": source_name,
                    "url": url,
                    "apply_url": url,
                    "source_url": url,
                    "date_posted": parse_date(item.get("created")),
                    "closing_date": None,
                    "salary_min": item.get("salary_min"),
                    "salary_max": item.get("salary_max"),
                    "description": clean_html(item.get("description") or ""),
                    "query": query,
                }
                jobs.append(job)
    stats.log_source(source_name, len(jobs))
    return jobs


def fetch_usajobs(profile: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "USAJOBS"
    email = env("USAJOBS_EMAIL")
    api_key = env("USAJOBS_API_KEY")
    if not email or not api_key:
        print("Skipping USAJOBS: USAJOBS_EMAIL or USAJOBS_API_KEY not set.")
        return []

    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    session.headers.update({
        "Host": "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": api_key,
    })
    federal_queries = limited(profile.get("federal_queries") or profile.get("queries", []), profile.get("max_usajobs_keywords", 25))
    for keyword in federal_queries:
        params = {
            "Keyword": keyword,
            "LocationName": "United States",
            "ResultsPerPage": 50,
            "DatePosted": 30,
        }
        try:
            r = session.get("https://data.usajobs.gov/api/search", params=params, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            stats.log_error(f"USAJOBS request failed for {keyword!r}: {exc}")
            continue

        for item in payload.get("SearchResult", {}).get("SearchResultItems", []):
            desc = item.get("MatchedObjectDescriptor", {})
            title = desc.get("PositionTitle") or "Untitled federal role"
            organization = desc.get("OrganizationName") or desc.get("DepartmentName") or "Federal agency"
            locations = desc.get("PositionLocation", []) or []
            location = "; ".join(loc.get("LocationName", "") for loc in locations if loc.get("LocationName")) or "United States"
            url = desc.get("PositionURI") or ""
            remuneration = desc.get("PositionRemuneration") or []
            salary_min = remuneration[0].get("MinimumRange") if remuneration else None
            salary_max = remuneration[0].get("MaximumRange") if remuneration else None
            job = {
                "id": stable_id("usajobs", title, organization, url),
                "title": title,
                "company": organization,
                "location": location,
                "source": source_name,
                "url": url,
                "apply_url": url,
                "source_url": url,
                "date_posted": parse_date(desc.get("PublicationStartDate")),
                "closing_date": parse_date(desc.get("ApplicationCloseDate")),
                "salary_min": salary_min,
                "salary_max": salary_max,
                "description": clean_html(desc.get("UserArea", {}).get("Details", {}).get("JobSummary", "")),
                "query": keyword,
            }
            jobs.append(job)
    stats.log_source(source_name, len(jobs))
    return jobs


def fetch_greenhouse(profile: Dict[str, Any], targets: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "Greenhouse"
    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    boards = targets.get("greenhouse_boards", [])
    for board in boards:
        token = str(board.get("board", "")).strip()
        company_name = board.get("company") or token
        if not token:
            continue
        url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs"
        try:
            r = session.get(url, params={"content": "true"}, timeout=REQUEST_TIMEOUT)
            if r.status_code == 404:
                print(f"Skipping Greenhouse board {token!r}: not found.")
                continue
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            stats.log_error(f"Greenhouse request failed for {company_name} ({token}): {exc}")
            continue

        for item in payload.get("jobs", []):
            title = item.get("title") or "Untitled role"
            location = (item.get("location") or {}).get("name") or "Not listed"
            direct_url = item.get("absolute_url") or ""
            departments = ", ".join(d.get("name", "") for d in item.get("departments", []) if d.get("name"))
            offices = ", ".join(o.get("name", "") for o in item.get("offices", []) if o.get("name"))
            description = " ".join([departments, offices, clean_html(item.get("content") or "")]).strip()
            job = {
                "id": stable_id("greenhouse", token, item.get("id"), title),
                "title": title,
                "company": company_name,
                "location": location,
                "source": f"Greenhouse: {company_name}",
                "url": direct_url,
                "apply_url": direct_url,
                "source_url": direct_url,
                "date_posted": parse_date(item.get("updated_at")),
                "closing_date": None,
                "salary_min": None,
                "salary_max": None,
                "description": description,
                "query": f"{company_name} {board.get('focus','')}",
            }
            jobs.append(job)
    stats.log_source(source_name, len(jobs))
    return jobs


def fetch_lever(profile: Dict[str, Any], targets: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "Lever"
    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    sites = targets.get("lever_sites", [])
    for site_cfg in sites:
        site = str(site_cfg.get("site", "")).strip()
        company_name = site_cfg.get("company") or site
        if not site:
            continue
        url = f"https://api.lever.co/v0/postings/{site}"
        try:
            r = session.get(url, params={"mode": "json", "limit": 100}, timeout=REQUEST_TIMEOUT)
            if r.status_code == 404:
                print(f"Skipping Lever site {site!r}: not found.")
                continue
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            stats.log_error(f"Lever request failed for {company_name} ({site}): {exc}")
            continue

        for item in payload if isinstance(payload, list) else []:
            title = item.get("text") or item.get("title") or "Untitled role"
            categories = item.get("categories") or {}
            location = categories.get("location") or item.get("workplaceType") or "Not listed"
            commitment = categories.get("commitment") or ""
            team = categories.get("team") or categories.get("department") or ""
            hosted_url = item.get("hostedUrl") or ""
            apply_url = item.get("applyUrl") or hosted_url
            salary = item.get("salaryRange") or {}
            desc_parts = [
                team,
                commitment,
                item.get("descriptionPlain") or item.get("description") or "",
                item.get("additionalPlain") or item.get("additional") or "",
            ]
            for section in item.get("lists", []) or []:
                if isinstance(section, dict):
                    desc_parts.append(text_from_mixed(section.get("text")))
                    desc_parts.append(text_from_mixed(section.get("content")))
                else:
                    desc_parts.append(text_from_mixed(section))
            description = clean_html(" ".join(text_from_mixed(p) for p in desc_parts if p))
            job = {
                "id": stable_id("lever", site, item.get("id"), title),
                "title": title,
                "company": company_name,
                "location": location,
                "source": f"Lever: {company_name}",
                "url": hosted_url or apply_url,
                "apply_url": apply_url,
                "source_url": hosted_url or apply_url,
                "date_posted": parse_date(item.get("createdAt") or item.get("updatedAt")),
                "closing_date": None,
                "salary_min": salary.get("min") if isinstance(salary, dict) else None,
                "salary_max": salary.get("max") if isinstance(salary, dict) else None,
                "description": description,
                "query": f"{company_name} {site_cfg.get('focus','')}",
            }
            jobs.append(job)
    stats.log_source(source_name, len(jobs))
    return jobs


def fetch_remotive(profile: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "Remotive"
    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    queries = limited(profile.get("remote_queries", []), profile.get("max_remote_queries", 18))
    for query in queries:
        try:
            r = session.get("https://remotive.com/api/remote-jobs", params={"search": query}, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            stats.log_error(f"Remotive request failed for {query!r}: {exc}")
            continue
        for item in payload.get("jobs", []):
            title = item.get("title") or "Untitled remote role"
            company = item.get("company_name") or "Unknown company"
            url = item.get("url") or ""
            job = {
                "id": stable_id("remotive", title, company, url),
                "title": title,
                "company": company,
                "location": item.get("candidate_required_location") or "Remote",
                "source": source_name,
                "url": url,
                "apply_url": url,
                "source_url": url,
                "date_posted": parse_date(item.get("publication_date")),
                "closing_date": None,
                "salary_min": None,
                "salary_max": None,
                "description": clean_html(item.get("description") or item.get("category") or ""),
                "query": query,
            }
            jobs.append(job)
    stats.log_source(source_name, len(jobs))
    return jobs


def fetch_arbeitnow(profile: Dict[str, Any], stats: FetchStats) -> List[Dict[str, Any]]:
    source_name = "Arbeitnow"
    jobs: List[Dict[str, Any]] = []
    session = requests_session()
    url = "https://www.arbeitnow.com/api/job-board-api"
    # Arbeitnow skews Europe/global tech. Pull a small page and filter by fit score later.
    pages_to_fetch = 2
    for _ in range(pages_to_fetch):
        try:
            r = session.get(url, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            stats.log_error(f"Arbeitnow request failed: {exc}")
            break
        for item in payload.get("data", []) if isinstance(payload, dict) else []:
            title = item.get("title") or "Untitled role"
            company = item.get("company_name") or "Unknown company"
            job_url = item.get("url") or ""
            tags = ", ".join(item.get("tags") or [])
            job_types = ", ".join(item.get("job_types") or [])
            location = item.get("location") or ("Remote" if item.get("remote") else "Not listed")
            job = {
                "id": stable_id("arbeitnow", title, company, job_url),
                "title": title,
                "company": company,
                "location": location,
                "source": source_name,
                "url": job_url,
                "apply_url": job_url,
                "source_url": job_url,
                "date_posted": parse_date(item.get("created_at")),
                "closing_date": None,
                "salary_min": None,
                "salary_max": None,
                "description": clean_html(" ".join([tags, job_types, item.get("description") or ""])),
                "query": "energy data analyst renewable python remote",
            }
            jobs.append(job)
        next_url = (payload.get("links") or {}).get("next") if isinstance(payload, dict) else None
        if not next_url:
            break
        url = next_url
    stats.log_source(source_name, len(jobs))
    return jobs


def add_company_search_fallbacks(targets: Dict[str, Any], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Add non-posting watchlist entries as searchable links, clearly marked.

    These are not counted as direct job postings; they help the dashboard provide employer links
    when an employer does not expose a clean API feed.
    """
    jobs: List[Dict[str, Any]] = []
    query_suffix = " ".join(["careers", "United States", "USA", "geothermal", "reservoir engineer", "production analyst", "energy jobs"])
    for item in targets.get("company_search_fallbacks", []):
        name = item.get("name") or "Target company"
        url = item.get("url") or ""
        search_url = url if is_http_url(url) else "https://www.google.com/search?" + urlencode({"q": f"{name} {query_suffix}"})
        job = {
            "id": stable_id("company-watch", name, search_url),
            "title": f"Company career page watch: {name}",
            "company": name,
            "location": "United States company career page",
            "source": "Company Watchlist",
            "url": search_url,
            "apply_url": search_url,
            "source_url": search_url,
            "direct_url": True,
            "link_type": "direct",
            "date_posted": datetime.now(timezone.utc).date().isoformat(),
            "closing_date": None,
            "salary_min": None,
            "salary_max": None,
            "description": f"Manual career-page/capture check for {name}. Website/careers source from Houston oil-and-gas watchlist or direct company page where available. Focus: {item.get('focus','energy roles')}. Capture method: {item.get('capture_method', 'Direct career page/search fallback; not scraped unless API feed exists')}. Use this when APIs miss postings on employer sites.",
            "query": item.get("focus", "target company career page"),
            "is_watchlist_item": True,
            "capture_method": item.get("capture_method", "direct career page/search fallback"),
        }
        # Give watchlist items moderate fit but they should appear after real postings.
        job["fit_score"] = 35
        job["role_family"] = role_family(job)
        jobs.append(job)
    return jobs


def dedupe(jobs: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: Dict[str, Dict[str, Any]] = {}
    for job in jobs:
        url = str(job.get("url") or job.get("apply_url") or "").strip()
        if url and job.get("direct_url") is not False:
            key = url.lower().rstrip("/")
        else:
            key = f"{job.get('title','').lower()}|{job.get('company','').lower()}|{job.get('location','').lower()}"
        if key not in seen:
            seen[key] = job
        else:
            if len(job.get("description", "")) > len(seen[key].get("description", "")):
                original_score = seen[key].get("fit_score")
                seen[key].update(job)
                if original_score is not None:
                    seen[key]["fit_score"] = max(original_score, job.get("fit_score", 0))
    return list(seen.values())


def sample_jobs() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": "sample-geothermal-reservoir-engineer",
            "title": "Geothermal Reservoir Engineer - Full-Time / Early Career",
            "company": "Sample Geothermal Co.",
            "location": "California, United States",
            "source": "Sample",
            "url": "https://www.google.com/search?q=Geothermal+Reservoir+Engineer+Full-Time+Early+Career+job+posting",
            "direct_url": False,
            "link_type": "search",
            "date_posted": now,
            "closing_date": "2027-05-01",
            "description": "Support geothermal reservoir surveillance, injectivity analysis, production analytics, Python workflows, and field data interpretation for EGS and hydrothermal assets.",
        },
        {
            "id": "sample-production-analyst",
            "title": "Petroleum Production Data Analyst",
            "company": "Sample Energy Operator",
            "location": "Houston, TX / Hybrid",
            "source": "Sample",
            "url": "https://www.google.com/search?q=Petroleum+Production+Data+Analyst+job+posting",
            "direct_url": False,
            "link_type": "search",
            "date_posted": now,
            "closing_date": None,
            "description": "Analyze production trends, well performance, reservoir behavior, decline curves, and operational data using Python, SQL, Tableau, and petroleum engineering fundamentals.",
        },
    ]



def process_jobs(fetched: Iterable[Dict[str, Any]], profile: Dict[str, Any], include_watchlist: bool = False) -> List[Dict[str, Any]]:
    processed: List[Dict[str, Any]] = []
    minimum_fit = int(profile.get("minimum_fit_score", 62))
    strict_cv = bool(profile.get("strict_cv_matching", True))
    for job in dedupe(fetched):
        if is_excluded_job(job, profile):
            continue
        if not is_recent_job(job, profile):
            continue
        if not is_us_based_job(job, profile):
            continue
        if strict_cv and not job.get("is_watchlist_item") and not passes_cv_relevance_gate(job, profile):
            continue
        job = ensure_job_url(job)
        if "fit_score" not in job:
            job["fit_score"] = fit_score(job, profile)
        if "role_family" not in job:
            job["role_family"] = role_family(job)
        signals = cv_relevance_signals(job, profile)
        existing_reasons = job.get("match_reasons") or []
        cv_reasons = signals.get("reasons") or []
        if cv_reasons:
            job["match_reasons"] = list(dict.fromkeys(existing_reasons + cv_reasons))[:12]
        # Keep real postings above the stricter CV threshold. Watchlist links are optional helper links.
        if job.get("is_watchlist_item") or job.get("fit_score", 0) >= minimum_fit:
            processed.append(job)
    return processed


def write_watchlist_for_ui(targets: Dict[str, Any]) -> None:
    """Keep the side-panel company list synced with expanded source targets."""
    companies: List[Dict[str, str]] = []
    seen = set()
    for item in targets.get("company_search_fallbacks", []):
        name = item.get("name")
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        companies.append({"name": name, "url": item.get("url", ""), "focus": item.get("focus", "")})
    for item in targets.get("greenhouse_boards", []) + targets.get("lever_sites", []):
        name = item.get("company")
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        url = "https://www.google.com/search?" + urlencode({"q": f"{name} careers geothermal petroleum reservoir production jobs United States"})
        companies.append({"name": name, "url": url, "focus": item.get("focus", "")})
    WATCHLIST_PATH.write_text(json.dumps(companies, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    profile = load_profile()
    targets = load_source_targets()
    stats = FetchStats()
    fetched: List[Dict[str, Any]] = []

    fetched.extend(fetch_adzuna(profile, stats))
    fetched.extend(fetch_usajobs(profile, stats))
    fetched.extend(fetch_greenhouse(profile, targets, stats))
    fetched.extend(fetch_lever(profile, targets, stats))
    fetched.extend(fetch_remotive(profile, stats))
    fetched.extend(fetch_arbeitnow(profile, stats))

    jobs = process_jobs(fetched, profile)

    # Add clearly marked company career-page links as a fallback section after real postings.
    watchlist_items = process_jobs(add_company_search_fallbacks(targets, profile), profile, include_watchlist=True)
    jobs.extend(watchlist_items)

    if not jobs:
        print("No live jobs fetched or no jobs passed filters. Writing sample data so the site can be previewed.")
        jobs = process_jobs(sample_jobs(), profile)

    jobs = dedupe(jobs)
    jobs.sort(key=lambda j: (0 if j.get("is_watchlist_item") else 1, j.get("fit_score", 0), j.get("date_posted") or ""), reverse=True)

    write_watchlist_for_ui(targets)

    payload = {
        "metadata": {
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "total_jobs": len(jobs),
            "sources_enabled": sorted({j.get("source") for j in jobs if j.get("source")}),
            "source_attempts": sorted(set(stats.attempted_sources)),
            "source_counts_raw": stats.source_counts,
            "source_errors": stats.errors[-20:],
            "target_start_date": profile.get("target_start_date"),
            "employment_type": profile.get("employment_type", "full-time"),
            "minimum_fit_score": profile.get("minimum_fit_score", 62),
            "strict_cv_matching": profile.get("strict_cv_matching", True),
            "cv_profile_summary": profile.get("cv_profile_summary", ""),
            "min_posted_date": profile.get("min_posted_date"),
            "max_job_age_days": profile.get("max_job_age_days", 120),
            "country_scope": "United States only" if profile.get("us_only", True) else "Not restricted",
        },
        "jobs": jobs,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(jobs)} matched jobs/watchlist links to {OUTPUT_PATH}")
    print(f"Raw source counts: {json.dumps(stats.source_counts, indent=2)}")
    if stats.errors:
        print(f"Completed with {len(stats.errors)} source warnings. See data/jobs.json metadata.source_errors.")


if __name__ == "__main__":
    main()
