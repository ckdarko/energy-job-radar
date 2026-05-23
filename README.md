# Energy Job Radar

A lightweight, free-to-host job-search site tailored for petroleum engineering, geothermal energy, renewable energy, production analysis, reservoir/subsurface analytics, and energy-transition roles. It is designed for opportunities starting **May 2027 or earlier**.

The app has two parts:

1. **Static dashboard**: `index.html`, `styles.css`, and `app.js` display, filter, save, and export job postings.
2. **Automatic updater**: `scripts/fetch_jobs.py` pulls postings from API-friendly job sources and writes `data/jobs.json`. GitHub Actions runs it on a schedule.

## What it does

- Searches for roles related to geothermal, EGS, reservoir engineering, petroleum engineering, production analysis, subsurface data, Python/ML, carbon storage, hydrogen, and renewable energy.
- Scores each job against your background and expected start window.
- Filters by role family, location, source, new jobs, remote/hybrid, saved jobs, and expired postings.
- Lets you save jobs and track statuses in your browser.
- Exports filtered results to CSV.
- Updates automatically once per day through GitHub Actions.

## Sources included

- **Adzuna Jobs API** for broad public job postings.
- **USAJOBS API** for U.S. federal jobs and internships.
- **Target company watchlist** for manual career-page checks when API sources miss employer-specific roles.

The app intentionally avoids scraping LinkedIn/Indeed directly. For reliability and compliance, use official APIs, RSS feeds, or employer career pages that allow automated access.

## Quick start locally

```bash
cd job-radar-app
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/fetch_jobs.py
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Without API keys, the script writes sample data so you can preview the site.

## API keys and GitHub secrets

### 1. Adzuna

Create an Adzuna developer account and add these repository secrets:

- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`

### 2. USAJOBS

Request a USAJOBS API key and add these repository secrets:

- `USAJOBS_EMAIL` — the email address used for the API request.
- `USAJOBS_API_KEY` — the authorization key from USAJOBS.

## Deploy on GitHub Pages

1. Create a new GitHub repository, for example: `energy-job-radar`.
2. Upload all files in this folder.
3. Go to **Settings → Secrets and variables → Actions → New repository secret** and add the API keys above.
4. Go to **Actions → Update job postings → Run workflow** to fetch the first live dataset.
5. Go to **Settings → Pages**.
6. Set the source to **Deploy from a branch**.
7. Select the `main` branch and `/root` folder.
8. Your site will be available at a URL like:

```text
https://YOUR-GITHUB-USERNAME.github.io/energy-job-radar/
```

## Edit your search strategy

Open `config/profile.json` and edit:

- `queries` — search phrases used by the updater.
- `locations` — preferred locations.
- `positive_keywords` — terms that increase fit score.
- `negative_keywords` — terms that reduce fit score.
- `target_start_date` — currently set to `2027-05-01`.

Examples of useful queries for this profile:

```json
"geothermal reservoir engineer",
"petroleum reservoir engineer entry level",
"production data analyst oil gas",
"reservoir simulation engineer CMG Petrel",
"subsurface data analyst Python",
"carbon storage reservoir engineer",
"summer 2027 geothermal internship"
```

## Update frequency

The workflow file `.github/workflows/update-jobs.yml` currently runs daily at `13:00 UTC`. You can change the cron schedule there.

## Optional improvements

- Add email alerts for jobs with fit score above 75.
- Add a Notion, Airtable, or Google Sheets export.
- Add employer career-page APIs where available.
- Add a simple backend if you want cloud-synced saved jobs instead of browser-only saved jobs.
- Add separate dashboards for internships, early-career roles, and full-time PhD-level roles.

## Files

```text
job-radar-app/
├── index.html
├── styles.css
├── app.js
├── requirements.txt
├── README.md
├── config/
│   ├── profile.json
│   └── company_watchlist.json
├── data/
│   └── jobs.json
├── scripts/
│   └── fetch_jobs.py
└── .github/
    └── workflows/
        └── update-jobs.yml
```
