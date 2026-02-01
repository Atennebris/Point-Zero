# 🎯 Point Zero

> **OSINT tool for searching military facilities and medical institutions based on open geodata**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Production Ready](https://img.shields.io/badge/Status-v1.3.0%20Production-brightgreen.svg)](https://github.com)
[![Made for: AI Vibe Hackathon](https://img.shields.io/badge/Hackathon-AI%20Vibe%202026-ff69b4.svg)](https://aicodingplus.com)

---

## 📖 Overview

**Point Zero** is a static web application for analyzing open geodata (OSINT). It allows you to search and visualize military facilities, hospitals, and other strategic points on an interactive map using OpenStreetMap and Overpass API.

### Key Features

- 🗺️ **Interactive map** based on Leaflet.js with multiple layers (Street, Satellite, Topographic)
- 🔍 **Extended radius search** (0.001-10000 km) with validation
- 🎯 **Filter by type** (military facilities, hospitals) + Advanced Filters (size, date, name)
- 📥 **Data export** in 7 formats (CSV, JSON, GeoJSON, HTML, TXT, MD, ZIP)
- 🔗 **Shareable Links** — share search results via URL
- 📜 **Search history** with localStorage persistence (max 50)
- 🌓 **Dark/Light theme** with auto-save
- ⚙️ **Application settings** — save user preferences
- 🔥 **Heatmap visualization** — density heatmap of objects
- 🗂️ **Marker Clustering** — automatic grouping when > 50 results
- 🌐 **Multiple data sources** — OpenStreetMap, GeoNames, Wikidata
- 🔑 **API Credentials** — support for user API keys
- ✅ **Coordinate validation** with visual feedback
- 🔒 **100% client-side** — no servers, no tracking

---

## 🚀 Quick Start

### GitHub Pages (online)

Simply open in your browser:
```
https://Atennebris.github.io/Point-Zero/
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/Atennebris/Point-Zero.git

# Navigate to the directory
cd Point-Zero

# Open index.html in browser
# Windows:
start index.html
# macOS:
open index.html
# Linux:
xdg-open index.html
```

**Requirements:** Modern browser with ES6+ support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

---

## 📚 User Guide

### 1️⃣ Basic Search

1. **Set coordinates:**
   - Manually enter latitude/longitude
   - Or click on the map for automatic placement
   - Or use test locations (Pentagon, Moscow, Berlin)

2. **Configure parameters:**
   - Search radius: if below 1 displays in meters, if above 1 in kilometers
   - Filters: military facilities and/or military hospitals

3. **Run search:**
   - Click "🔍 Find Objects" button
   - Wait for completion (status in left panel)

### 2️⃣ Working with Results

- **View on map:** Each object marked with a colored marker
  - 🔴 Red — military facilities
  - 🟢 Green — hospitals
  - 🔵 Blue — search center

- **Object details:** Click on marker to view:
  - Object name
  - Type/subtype
  - Data source

### 3️⃣ Data Export

1. After successful search, click **"📥 Export Results"**
2. Select format:
   - **CSV** — for Excel/Google Sheets
   - **JSON** — for programming
   - **GeoJSON** — for QGIS/ArcGIS
   - **HTML** — beautiful browser report
   - **TXT** — simple text list
   - **Markdown** — for documentation/GitHub
   - **ZIP** — all formats in one archive

3. Specify filename and download

### 4️⃣ Shareable Links

1. After search, click **"🔗 Share Search"**
2. Copy URL (automatically to clipboard)
3. Send link — recipient will see the same results

**Example URL:**
```
?lat=55.7558&lon=37.6173&radius=20&military=1&hospital=1&auto=1
```

### 5️⃣ Search History

- All searches automatically saved in browser
- Open **"📜 Search History"** to view
- Click on record to restore parameters + auto-search
- Stores up to 50 recent searches

### 6️⃣ Theme Switching

- Click on **🌙/☀️** icon in header
- Theme automatically saved between sessions

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Cartography** | Leaflet.js | 1.9.4 |
| **Clustering** | Leaflet.markercluster | 1.5.3 |
| **Heatmap** | Leaflet.heat | 0.2.0 |
| **Tile Provider** | OpenStreetMap, Esri WorldImagery, OpenTopoMap | — |
| **Geodata** | Overpass API, GeoNames API, Wikidata API | — |
| **Archiving** | JSZip | 3.10.1 |
| **Frontend** | Vanilla JavaScript (modular structure) | ES6+ |
| **Styling** | CSS3 with CSS Variables | — |
| **Storage** | LocalStorage API | — |

### Architecture

- **Modular structure** — 15 files (1 HTML, 1 CSS, 14 JS modules)
- **Separation of concerns** — each module responsible for its area
- **No server-side** — 100% client-side operation
- **Static application** — works on GitHub Pages without server
- **Fallback servers** — 3 reserve Overpass API servers for reliability
- **Multiple data sources** — OpenStreetMap, GeoNames, Wikidata

---

## 🔒 Privacy and Security

### ✅ What we DON'T do

- ❌ Don't send data to third-party servers
- ❌ Don't use analytics/tracking
- ❌ Don't collect personal data
- ❌ Don't use cookies

### ✅ What we DO

- ✅ All requests go directly to Overpass API
- ✅ Search history stored only in your browser
- ✅ Source code open for audit
- ✅ Validation of all user inputs

### Limitations

- Data current as of OpenStreetMap update
- Accuracy depends on OSM mapping quality
- Military facilities may be:
  - Not marked on map
  - Deliberately hidden/masked
  - Incorrectly designated
- **This is a tool for legal OSINT, not for breaking laws**

---

## 🗺️ Data Sources

### OpenStreetMap (OSM)

- **License:** Open Database License (ODbL)
- **Coverage:** Worldwide
- **Updates:** Real-time (community-driven)
- **Website:** [openstreetmap.org](https://www.openstreetmap.org)

### Overpass API

- **Purpose:** Query language for OSM data
- **Endpoint:** `https://overpass-api.de/api/interpreter`
- **Fallback servers:**
  - `https://overpass.kumi.systems/api/interpreter`
  - `https://overpass.openstreetmap.ru/api/interpreter`
- **Documentation:** [wiki.openstreetmap.org/wiki/Overpass_API](https://wiki.openstreetmap.org/wiki/Overpass_API)

### Leaflet.js

- **Purpose:** JavaScript library for interactive maps
- **License:** BSD 2-Clause
- **Website:** [leafletjs.com](https://leafletjs.com)

---

## 💻 Development

### Requirements

- Text editor (VS Code, Sublime, etc.)
- Browser with DevTools (Chrome/Firefox)
- Git (for version control)

### Local Development

```bash
# Open index.html in editor
code index.html

# Run live server (optional)
# VS Code: Live Server extension
# Python: python -m http.server 8000
# Node: npx http-server .

# Open in browser
# http://localhost:8000
```

### Project Structure

```
Point-Zero/
│
├── index.html              # Main HTML file (235 lines)
├── README.md               # Documentation (this file)
├── .gitignore              # Git ignore rules
│
├── css/
│   └── styles.css          # All application styles (750+ lines)
│
├── js/                     # JavaScript modules (14 files)
│   ├── config.js           # Global state and constants
│   ├── utils.js            # Utilities (sleep, fetchWithRetry, addStatus)
│   ├── validation.js       # Coordinate validation
│   ├── theme.js            # Theme switching
│   ├── logo.js             # Interactivity logic
│   ├── settings.js         # Settings system
│   ├── credentials.js      # API credentials
│   ├── datasources.js      # Data source management
│   ├── history.js          # Search history
│   ├── share.js            # Share functionality
│   ├── filters.js          # Advanced filters and heatmap
│   ├── tests.js            # Test locations toggle
│   ├── api.js              # API requests (Overpass, GeoNames, Wikidata)
│   ├── export.js           # Export to 7 formats
│   ├── map.js              # Map and visualization
│   └── app.js              # Main application logic
│
├── assets/
│   └── images/
│       └── logo.png        # Favicon (512×512px)
│
│
├── docs/                   # Additional documentation
│    └── README_RU.md
│
└── README.md
```

### Code Conventions

According to `.claude/CLAUDE.md`:

- **Code (variables, functions):** English
- **Code comments:** Russian
- **UI (interface):** English
- **Documentation:** English, Russian

**Principles:**
- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Ain't Gonna Need It)

### Project Creation with AI

This project was entirely created by **Atennebris** using neural networks from **Anthropic**:

- **Primary Model:** Claude Sonnet 4.5 (with thinking feature)
- **Platform:** Claude Code — CLI (Command Line Interface) by Anthropic
- **Interface:** Graphical version of Claude Code via VS Code IDE extension
- **Author's Role:** Directing and managing the development process without directly writing code
- **Auxiliary Tools:** ChatGPT (OpenAI) and Gemini (Google) for minor tasks

**Important:** All code and documentation were generated by Claude Sonnet 4.5 neural network. The author did not write code manually, but only directed the development process through prompts and clarifications.

---

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Atennebris

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🏆 Credits

### AI Vibe Coding Hackathon 2026

This project was created for **AI Vibe Coding Hackathon** 

### OpenStreetMap Community

Thanks to the mappers worldwide supporting OpenStreetMap.

### Used Libraries

- [Leaflet.js v1.9.4](https://leafletjs.com) — interactive maps
- [Leaflet.markercluster v1.5.3](https://github.com/Leaflet/Leaflet.markercluster) — marker clustering
- [Leaflet.heat v0.2.0](https://github.com/Leaflet/Leaflet.heat) — heatmap visualization
- [JSZip v3.10.1](https://stuk.github.io/jszip/) — ZIP archive creation
- [OpenStreetMap](https://www.openstreetmap.org) — cartographic data
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) — query language for OSM
- [GeoNames API](http://www.geonames.org) — global geographic database
- [Wikidata Query Service](https://query.wikidata.org) — SPARQL queries to Wikidata

---

## 📞 Support

### Found a bug?

1. Check [existing issues](https://github.com/Atennebris/Point-Zero/issues)
2. Create new issue with description:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)

### Improvement idea?

Create issue with label `enhancement` and describe:
- Problem that your idea solves
- Proposed solution
- Alternative options

### Contacts

- **GitHub:** [github.com/Atennebris/Point-Zero](https://github.com/Atennebris/Point-Zero)
- **Email:** [tene6r1ss@gmail.com](mailto:tene6r1ss@gmail.com)
- **Telegram:** [@Atennebris](https://t.me/Atennebris)
- **Telegram Group:** [Atennebris Obscura](https://t.me/atennebris_obscura)
- **Discord:** tene6ris_08752

---

## ⚖️ Disclaimer

**Point Zero** is a tool for legal OSINT (Open Source Intelligence) research based on publicly available OpenStreetMap data.

### Usage:

✅ **Allowed:**
- Educational purposes
- Research projects
- Journalistic investigations
- Open Data analysis
- Geospatial analytics

❌ **Prohibited:**
- Illegal reconnaissance
- Privacy violations
- Military operations without appropriate permissions
- Any activity violating laws of your jurisdiction

### ⚠️ User Responsibility

**IMPORTANT:**

The author (Atennebris) created Point Zero exclusively as:
- 📚 **Educational tool** — study of OSINT methodologies and open data
- 🔬 **Research project** — demonstration of Open Data analysis capabilities
- 🏆 **Hackathon product** — participation in AI Vibe Coding Hackathon 2026

**The author is NOT responsible for:**
- Actions of third parties using this tool
- Consequences of improper use of the software
- User violations of legislation
- Any direct or indirect damage resulting from use

**By using Point Zero, you:**
- Accept full responsibility for your actions
- Agree to comply with the laws of your jurisdiction
- Understand that the tool is provided "AS IS" without warranties
- Acknowledge that all data is obtained from public sources (OpenStreetMap, GeoNames, Wikidata)

If you do not agree with these terms, do not use this software.

---

<div align="center">

**Made with ❤️**

⭐ Star this repo if the project was helpful!

[🏠 Home](index.html) · [📖 Documentation](README.md) · [🐛 Bug Report](https://github.com/Atennebris/Point-Zero/issues)

</div>
