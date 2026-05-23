"""Fetch job postings for Energy Job Radar.

Sources supported:
- Adzuna Jobs API (requires ADZUNA_APP_ID and ADZUNA_APP_KEY)
- USAJOBS API (requires USAJOBS_EMAIL and USAJOBS_API_KEY)

The script is designed for GitHub Actions. It writes data/jobs.json, which the static web app reads.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urlencode

import requests

ROOT = Path(__file__).resolve().parents[1]
PROFILE_PATH = ROOT / "config" / "profile.json"
OUTPUT_PATH = ROOT / "data" / "jobs.json"


def load_profile() -> Dict[str, Any]:
    with PROFILE_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def env(name: str) -> str:
    return os.getenv(name, "").strip()


def clean_html(value: str) -> str:
    if not value:
        return ""
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def stable_id(*parts: str) -> str:
    raw = "|".join((p or "").lower().strip() for p in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = str(value).strip()
    # Keep date-only values date-only. ISO timestamps work in the browser too.
    return value[:10] if re.match(r"^\d{4}-\d{2}-\d{2}", value) else value


def fit_score(job: Dict[str, Any], profile: Dict[str, Any]) -> int:
    text = f"{job.get('title','')} {job.get('company','')} {job.get('description','')} {job.get('location','')}".lower()
    score = 30
    positive_hits = [kw for kw in profile.get("positive_keywords", []) if kw.lower() in text]
    negative_hits = [kw for kw in profile.get("negative_keywords", []) if kw.lower() in text]
    score += min(len(positive_hits) * 6, 42)
    score -= min(len(negative_hits) * 10, 30)
    if re.search(r"intern|graduate|new grad|entry|early career|associate|phd|research engineer", text):
        score += 12
    if re.search(r"geothermal|reservoir|production|subsurface|petroleum", text):
        score += 10
    if re.search(r"2027|summer 2027|may 2027|start date", text):
        score += 8
    return max(0, min(100, score))


def role_family(job: Dict[str, Any]) -> str:
    text = f"{job.get('title','')} {job.get('description','')}".lower()
    families = {
        "geothermal": ["geothermal", "egs", "enhanced geothermal", "hydrothermal"],
        "petroleum": ["petroleum", "reservoir", "well testing", "eor", "subsurface"],
        "production": ["production engineer", "production analyst", "operations", "facilities", "field engineer"],
        "data": ["data", "analytics", "machine learning", "python", "sql", "tableau", "power bi"],
        "renewable": ["renewable", "energy transition", "carbon storage", "ccs", "hydrogen", "solar", "wind"],
    }
    best = ("other", 0)
    for family, words in families.items():
        count = sum(1 for word in words if word in text)
        if count > best[1]:
            best = (family, count)
    return best[0]


def fetch_adzuna(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    app_id = env("ADZUNA_APP_ID")
    app_key = env("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        print("Skipping Adzuna: ADZUNA_APP_ID or ADZUNA_APP_KEY not set.")
        return []

    jobs: List[Dict[str, Any]] = []
    session = requests.Session()
    queries = profile.get("queries", [])
    # Use broad locations to avoid multiplying calls too heavily.
    locations = ["United States", "Texas", "California", "Remote"]
    for query in queries:
        for location in locations:
            url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
            params = {
                "app_id": app_id,
                "app_key": app_key,
                "results_per_page": 25,
                "what": query,
                "where": location,
                "sort_by": "date",
                "content-type": "application/json",
            }
            try:
                r = session.get(url, params=params, timeout=25)
                r.raise_for_status()
                payload = r.json()
            except Exception as exc:  # noqa: BLE001
                print(f"Adzuna request failed for {query!r} / {location!r}: {exc}", file=sys.stderr)
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
                    "source": "Adzuna",
                    "url": url,
                    "date_posted": parse_date(item.get("created")),
                    "closing_date": None,
                    "salary_min": item.get("salary_min"),
                    "salary_max": item.get("salary_max"),
                    "description": clean_html(item.get("description") or ""),
                    "query": query,
                }
                jobs.append(job)
    return jobs


def fetch_usajobs(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    email = env("USAJOBS_EMAIL")
    api_key = env("USAJOBS_API_KEY")
    if not email or not api_key:
        print("Skipping USAJOBS: USAJOBS_EMAIL or USAJOBS_API_KEY not set.")
        return []

    jobs: List[Dict[str, Any]] = []
    session = requests.Session()
    session.headers.update({
        "Host": "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": api_key,
    })
    # Federal queries work best with concise keywords.
    federal_queries = [
        "petroleum engineer",
        "geothermal",
        "reservoir engineer",
        "energy analyst",
        "data scientist energy",
        "hydrologist geothermal",
        "geologist geothermal",
    ]
    for keyword in federal_queries:
        params = {
            "Keyword": keyword,
            "LocationName": "United States",
            "ResultsPerPage": 50,
            "DatePosted": 30,
        }
        try:
            r = session.get("https://data.usajobs.gov/api/search", params=params, timeout=25)
            r.raise_for_status()
            payload = r.json()
        except Exception as exc:  # noqa: BLE001
            print(f"USAJOBS request failed for {keyword!r}: {exc}", file=sys.stderr)
            continue

        for item in payload.get("SearchResult", {}).get("SearchResultItems", []):
            desc = item.get("MatchedObjectDescriptor", {})
            title = desc.get("PositionTitle") or "Untitled federal role"
            organization = desc.get("OrganizationName") or desc.get("DepartmentName") or "Federal agency"
            locations = desc.get("PositionLocation", []) or []
            location = "; ".join(loc.get("LocationName", "") for loc in locations if loc.get("LocationName")) or "United States"
            url = desc.get("PositionURI") or ""
            job = {
                "id": stable_id("usajobs", title, organization, url),
                "title": title,
                "company": organization,
                "location": location,
                "source": "USAJOBS",
                "url": url,
                "date_posted": parse_date(desc.get("PublicationStartDate")),
                "closing_date": parse_date(desc.get("ApplicationCloseDate")),
                "salary_min": (desc.get("PositionRemuneration") or [{}])[0].get("MinimumRange") if desc.get("PositionRemuneration") else None,
                "salary_max": (desc.get("PositionRemuneration") or [{}])[0].get("MaximumRange") if desc.get("PositionRemuneration") else None,
                "description": clean_html(desc.get("UserArea", {}).get("Details", {}).get("JobSummary", "")),
                "query": keyword,
            }
            jobs.append(job)
    return jobs


def dedupe(jobs: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: Dict[str, Dict[str, Any]] = {}
    for job in jobs:
        url = job.get("url") or ""
        key = url if url and url != "#" else f"{job.get('title','').lower()}|{job.get('company','').lower()}|{job.get('location','').lower()}"
        if key not in seen:
            seen[key] = job
        else:
            # Keep richer descriptions and higher scores if duplicated.
            if len(job.get("description", "")) > len(seen[key].get("description", "")):
                seen[key].update(job)
    return list(seen.values())


def sample_jobs() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": "sample-geothermal-reservoir-engineer",
            "title": "Geothermal Reservoir Engineer Intern / Early Career",
            "company": "Sample Geothermal Co.",
            "location": "California, United States",
            "source": "Sample",
            "url": "#",
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
            "url": "#",
            "date_posted": now,
            "closing_date": None,
            "description": "Analyze production trends, well performance, reservoir behavior, decline curves, and operational data using Python, SQL, Tableau, and petroleum engineering fundamentals.",
        },
    ]


def main() -> None:
    profile = load_profile()
    fetched = []
    fetched.extend(fetch_adzuna(profile))
    fetched.extend(fetch_usajobs(profile))

    if not fetched:
        print("No live jobs fetched. Writing sample data so the site can be previewed.")
        fetched = sample_jobs()

    jobs = []
    for job in dedupe(fetched):
        job["fit_score"] = fit_score(job, profile)
        job["role_family"] = role_family(job)
        jobs.append(job)

    jobs.sort(key=lambda j: (j.get("fit_score", 0), j.get("date_posted") or ""), reverse=True)
    payload = {
        "metadata": {
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "total_jobs": len(jobs),
            "sources_enabled": sorted({j.get("source") for j in jobs if j.get("source")}),
            "target_start_date": profile.get("target_start_date"),
        },
        "jobs": jobs,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(jobs)} jobs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
