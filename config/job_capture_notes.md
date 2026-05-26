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

## Geothermal company/startup watchlist expansion

The app now includes a broad U.S.-focused geothermal watchlist with large operators, next-generation geothermal startups, geothermal heat-pump companies, drilling/service companies, engineering consultants, national labs, and geothermal-specific job boards.

### Automatic capture vs watch links

- **Automatic capture:** Works best when postings appear through Adzuna, USAJOBS, Greenhouse, Lever, Remotive, or Arbeitnow.
- **Known ATS feeds added:** Sage Geosystems through Greenhouse (`sage49`), Quaise Energy through Greenhouse (`quaise`), and Zanskar through Lever (`Zanskar`).
- **Watchlist/career-page links:** For companies using Paylocity, Workday, Oracle, iCIMS, custom websites, or private career portals, the app adds direct career-page/search links. These are shown as watchlist items and should be checked manually.
- **Recency:** The live job fetcher keeps postings from 2026 onward and preferably within the configured `max_job_age_days` window. Watchlist links are refreshed with the current date because they are company-monitoring links, not individual postings.

### Included geothermal groups

- Large operators/developers: Calpine, Ormat, Terra-Gen, Cyrq, Coso, BHE Renewables, EnergySource Minerals, Controlled Thermal Resources, Open Mountain Energy, Enel Green Power North America.
- Next-generation geothermal/startups: Fervo Energy, Sage Geosystems, Zanskar, Quaise Energy, XGS Energy, GreenFire Energy, Eavor, Bedrock Energy, Dandelion Energy, Darcy Solutions, Brightcore Energy, Geothermal Technologies Inc., Geothermal Radar, 400C Energy, Dig Energy, Gradient Geothermal, Transitional Energy, EarthBridge Energy, Eden GeoPower, AltaRock Energy, Baseload Capital, DeepPower, Mazama Energy, Ignis Energy, Teverra.
- Service/engineering/equipment: SLB, Baker Hughes, Halliburton, Nabors, NOV, POWER Engineers, Black & Veatch, Jacobs, Burns & McDonnell, Stantec, WSP, Tetra Tech, AECOM, Atlas Copco, Vallourec, Mitsubishi Power, Fuji Electric, Turboden, Exergy, Climeon, GA Drilling, Thermochem, Geologica, Capuano Engineering.
- National labs/government: NREL, INL, LBNL, Sandia, NETL, ORNL, USGS.
- Job boards: Geothermal Rising, Breakthrough Energy Ventures, Terra.do, Climatebase, Clean Energy Jobs.
