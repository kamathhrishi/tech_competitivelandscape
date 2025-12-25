# Software Sector Competitive Intelligence Database

A comprehensive database tracking competitive relationships across 81 public software companies from the Russell 1000 index, spanning 2000-2024.

## Overview

This project aggregates and visualizes competitive intelligence data for major software companies. It provides structured, historical data on who competes with whom, how competitive landscapes have evolved over time, and cross-references between entities.

### Key Statistics

- **115 public companies** tracked (Russell 1000 software sector)
- **1,994 entities** referenced as competitors
- **5,078 relationships** mapped
- **26 years** of historical coverage (2000-2025)
- **600 JSON data files** containing research

## Data Structure

### Source Data

Raw competitive intelligence is stored in `/competitor_searches/` as individual JSON files, organized by company and year:

```
competitor_searches/
├── microsoft_2024.json
├── microsoft_2020.json
├── microsoft_2015.json
├── salesforce_2024.json
└── ...
```

Each JSON file contains:
- `company`: Company name
- `ticker`: Stock ticker symbol
- `year`: Year of competitive data
- `search_query`: Research query used
- `search_date`: When research was conducted
- `context`: Market context and company positioning
- `competitors`: Array of competitors with notes
- `sources`: URLs of source materials

### Compiled Data

The `compile-data.js` script aggregates all JSON files into a unified entity graph (`data.js`):

- **Entities**: All companies and referenced competitors
- **Relationships**: Bidirectional competitive relationships
- **Industries**: Inferred industry classifications
- **Cross-references**: Who cites whom as a competitor

## Companies Covered

The database includes major software companies across segments:

**Cloud & Infrastructure**: Microsoft, Amazon (AWS), Google Cloud, Oracle, IBM, Snowflake, MongoDB, Cloudflare, Nutanix

**Cybersecurity**: Palo Alto Networks, CrowdStrike, Fortinet, Zscaler, SentinelOne, Okta, Qualys, Tenable, Rapid7, Varonis, CyberArk

**Enterprise Software**: Salesforce, SAP, ServiceNow, Workday, Intuit, Adobe, Autodesk

**Data & Analytics**: Palantir, Datadog, Splunk, Teradata, Confluent, Elastic, Domo, Amplitude

**DevOps & Development**: Atlassian, GitLab, JFrog, HashiCorp, Dynatrace

**HR & Payroll**: Workday, Paycom, Paylocity, Ceridian

**CRM & Marketing**: Salesforce, HubSpot, Klaviyo, Braze, Sprinklr, Sprout Social

**Collaboration**: Zoom, Twilio, DocuSign, Box, Dropbox, Five9, Freshworks

**Design & Engineering**: Autodesk, ANSYS, Synopsys, Cadence, PTC, Altair, Bentley Systems, Aspen Technology

**Vertical Software**: Veeva (life sciences), Guidewire (insurance), Procore (construction), Tyler Technologies (government), nCino (banking), Blackbaud (nonprofits)

**Financial Software**: Bill Holdings, BlackLine, Zuora, FICO

**Ad Tech & IoT**: The Trade Desk, AppLovin, Samsara, Unity Software

**IT Services & Consulting**: Accenture, Cognizant, Globant, Gartner

**Networking & Infrastructure**: Arista Networks, F5, Akamai, NetApp, Pure Storage, Broadcom, Dell Technologies, Motorola Solutions, Zebra Technologies

**Data Management**: Informatica, Trimble

**Fintech & Payments**: Payoneer, WEX

**Consumer Tech**: Duolingo, Gen Digital

**Diversified Tech**: Roper Technologies, SAP, Shopify, Check Point Software

## Site Features

### Home View

- Alphabetically sorted list of public companies
- Filter by entity type (Public Companies / All Entities)
- Filter by industry segment
- Global search across all entities
- Quick stats: competitor count and citation count

### Entity Detail View

- Centered company header with ticker and type badge
- Key statistics: competitors, years of data, citations
- Industry tags
- **Year-based navigation**: Select any year to view that year's competitive data
- For each year:
  - Market context description
  - List of competitors with detailed notes
  - Source links to original research
- All Competitors summary grid
- Citations: which companies cite this entity as a competitor

### Design Principles

- **Information-first**: Clean, document-style layout focused on data
- **One year at a time**: Reduces cognitive load, focused viewing
- **Cross-referencing**: Every entity links to its own page
- **Professional aesthetic**: Light theme, minimal chrome, clear typography

## Technical Implementation

### Files

```
site/
├── index.html          # Main HTML structure
├── styles.css          # Clean, information-first CSS
├── app.js              # Application logic and rendering
├── data.js             # Compiled entity graph (generated)
├── compile-data.js     # Node.js script to compile JSON files
└── README.md           # This file
```

### Running Locally

1. Compile the data (if JSON files have changed):
   ```bash
   node compile-data.js
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000

### Technologies

- Vanilla HTML, CSS, JavaScript (no frameworks)
- Node.js for data compilation
- Inter and IBM Plex Mono fonts

## Data Sources

Competitive intelligence was compiled from:
- SEC filings (10-K, 10-Q reports)
- Company investor presentations
- Industry analyst reports
- Market research publications
- Business news and press releases

## Use Cases

- **Investment Research**: Understand competitive positioning
- **Market Analysis**: Track how competitive landscapes evolve
- **Business Development**: Identify potential partners or acquisition targets
- **Strategic Planning**: Map competitive threats and opportunities

## Project History

### Phase 1: Data Collection

The project began with identifying 85 software companies from the Russell 1000 index. For each company, web research was conducted to gather competitive intelligence across multiple time periods:

- **2024**: Current competitive landscape
- **2020**: Pre/during COVID market state
- **2015**: Mid-2010s market structure
- **2010**: Post-financial crisis landscape
- **2005**: Early cloud era (for established companies)
- **2000**: Dot-com era (for companies that existed then)

Research was conducted using web searches combining company names with terms like "competitors", "competitive landscape", and "market position". Results were structured into JSON files capturing:
- Market context and company positioning
- Named competitors with explanatory notes
- Source URLs for verification

**Final count**: 521 JSON files covering 97 public companies.

### Phase 2: Data Compilation

A Node.js script (`compile-data.js`) was built to:

1. Parse all JSON files from `/competitor_searches/`
2. Normalize company names to create consistent slugs
3. Identify which competitors are themselves public companies
4. Build bidirectional relationships (if A cites B, B's page shows A)
5. Aggregate notes by year for non-public entities
6. Infer industry classifications from context keywords
7. Output unified `data.js` for browser consumption

This creates an entity graph where every mentioned competitor becomes a navigable entity, even if it's a private company or subsidiary.

### Phase 3: Site Development

The web interface went through several design iterations:

**Iteration 1: Dark Theme Dashboard**
- Card-based grid layout
- Purple/pink gradient accents
- Collapsible timeline with all years visible
- Sidebar with stats and related entities

*Feedback: "Looks like a fun site, not serious for professional research"*

**Iteration 2: Light Professional Theme**
- Switched to light color scheme
- Clean borders, no gradients
- Professional blue accents
- Monospace fonts for data
- Collapsible year sections

*Feedback: "Hard to navigate, unintuitive"*

**Iteration 3: Information-First Design**
- Removed sidebar entirely
- Document-style single-column layout
- Simple list view on home page
- Year tabs to show one year at a time
- Focus on content, minimal UI chrome

*Feedback: "Much better"*

**Iteration 4: Final Refinements**
- Alphabetical sorting for company list
- Centered back button (styled as button)
- Centered header section (ticker, name, stats, industries)
- Left-aligned content (year tabs, competitors, sources)
- Public companies shown by default

### Design Decisions

**Why year tabs instead of full timeline?**
Showing all years at once creates information overload. Tabs let users focus on one time period, reducing cognitive load while maintaining access to historical data.

**Why center the header but not content?**
The header establishes identity and context—centering creates visual hierarchy and draws attention. Content (competitors, notes, sources) benefits from left-alignment for readability and scanning.

**Why a simple list instead of cards?**
Cards add visual noise. A clean list with inline stats is faster to scan and feels more like a data tool than a marketing site.

**Why cross-reference non-public entities?**
Many important competitors are private companies, subsidiaries, or products. Making them first-class entities with their own pages (showing who cites them) adds significant research value.

## Future Enhancements

Potential additions:
- Export functionality (CSV, JSON)
- Comparison view (two companies side-by-side)
- Network visualization of relationships
- Search within competitor notes
- Filtering by year range
- API access for programmatic queries

---

*Data compiled December 2024*
