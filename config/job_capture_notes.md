# Job capture notes

This project now includes a Houston oil-and-gas watchlist expanded from the EasyLeadz page supplied by the user.

## How postings are captured

1. Direct API capture: Adzuna, USAJOBS, Greenhouse, Lever, Remotive, and Arbeitnow are queried by `scripts/fetch_jobs.py`.
2. Recent-only filter: real postings are filtered to remove stale results before writing `data/jobs.json`. The default settings are `min_posted_date = 2026-01-01` and `max_job_age_days = 120`.
3. Company career-page/watchlist links: companies without a clean public API feed are included as career-page or Google-search fallback links. These are not scraped as postings; they are marked as Company Watchlist items.
4. Why not scrape every company site: many oil-and-gas employers use Workday, Oracle, iCIMS, Taleo, SuccessFactors, or JavaScript-heavy career portals. Those pages change often and may restrict automated scraping. The safe approach is to use official APIs where available and provide direct career-page/search links otherwise.

## Files controlling this behavior

- `config/profile.json`: keywords, queries, full-time-only filters, and recency settings.
- `config/source_targets.json`: Greenhouse/Lever targets plus company career-page/search fallback list.
- `config/houston_oil_gas_watchlist.json`: 100 Houston oil-and-gas companies added from the EasyLeadz list.
- `config/company_watchlist.json`: UI-ready target-company list.
- `scripts/fetch_jobs.py`: scheduled updater that fetches, filters, deduplicates, scores, and writes jobs.
