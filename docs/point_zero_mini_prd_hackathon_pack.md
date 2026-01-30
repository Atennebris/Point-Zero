# Point Zero

## One‑liner
Open‑source, zero‑backend geospatial OSINT web app that aggregates publicly available location‑based data around a chosen point and radius.

---

## Context (Hackathon)
- Format: Online (Devpost)
- Scope: Built during hackathon
- AI usage: **Development‑time only** (vibe coding). **No AI in product**.
- Deployment: **Static only** (GitHub Pages)
- Cost: **$0** (open data, no keys, no accounts)

---

## Problem
Collecting publicly available, location‑based information around a point of interest is fragmented, slow, and repetitive. Analysts repeatedly query multiple open sources and manually export results.

## Goal
Provide a fast, reproducible way to query open geospatial datasets by point + radius, filter by real tags, visualize results, and export structured reports.

---

## Users
- OSINT researchers
- Analysts
- Journalists
- Investigators
- Hobby researchers

---

## Core Data Sources (Open & Free)
- OpenStreetMap (Overpass API)
- Wikidata (SPARQL) — optional
- Public GeoJSON / CSV datasets — optional

No authentication. No API keys.

---

## Functional Scope (MVP)

### Map & Search
- Interactive map (Leaflet + OSM)
- Click to set latitude/longitude
- Radius selector (default 10–20 km, fully custom)
- Checkbox filters based on **real OSM tags**

### Results
- Render markers on map
- Tabular list of objects
- Basic statistics (counts, categories)

### Visualizations
- Bar chart (distribution by type)
- Pie chart (category share)

### Export & Sharing
- Export formats:
  - JSON
  - CSV
  - HTML
  - TXT
  - MD
- Export as **folder** containing selected files
- Shareable URL with query params:
  - `lat`, `lon`, `radius`, `filters`

### UI
- Dark mode toggle
- Zero backend
- Works fully offline after load (except data queries)

---

## Auto‑Generated Report (Non‑AI)

### Contents (User‑selectable)
- Metadata (coords, radius, timestamp)
- Data sources used
- Summary counts
- Table of results
- Bar chart
- Pie chart

### Export Structure
```
report/
 ├─ report.json
 ├─ report.csv
 ├─ report.html
 ├─ report.txt
 ├─ report.md
 └─ charts/
     ├─ bar.png
     └─ pie.png
```

---

## OSM Tag Strategy (Examples)

> Filters are built strictly on existing OSM tags

- `military=barracks`
- `military=bunker`
- `military=checkpoint`
- `military=naval_base`
- `military=airfield`
- `military=range`
- `military=office`
- `landuse=military`
- `building=military`

(Full tag list finalized during integration.)

---

## Non‑Goals
- No backend services
- No user accounts
- No AI inference in runtime
- No paid APIs

---

## Repository Structure
```
point-zero/
 ├─ index.html
 ├─ style.css
 ├─ app.js
 ├─ assets/
 ├─ docs/
 │   ├─ README.md
 │   └─ PRD.md
 └─ examples/
     └─ sample-reports/
```

---

## Success Criteria
- Runs on GitHub Pages
- Queries open data successfully
- Exports all declared formats
- Generates visual charts client‑side
- Public repo + live demo + video

---

## Submission Assets
- Live demo URL (GitHub Pages)
- Public GitHub repository
- README (EN)
- 2–3 min demo video
- Screenshots

---

## Status
Ready for final refactor, documentation, and submission.

