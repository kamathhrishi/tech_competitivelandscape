# Tech Competitive Intelligence Database

A comprehensive database tracking competitive relationships across 150+ public technology companies, spanning 2000-2025.

## Overview

This project aggregates and visualizes competitive intelligence data for major technology companies across software, hardware, fintech, e-commerce, streaming, gaming, and more. It provides structured, historical data on who competes with whom, how competitive landscapes have evolved over time, and cross-references between entities.

### Key Statistics

- **165 companies** tracked (public tech companies)
- **2,640+ entities** referenced as competitors
- **6,700+ relationships** mapped
- **26 years** of historical coverage (2000-2025)
- **806 JSON data files** containing research

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
- `ticker`: Stock ticker symbol (or "PRIVATE" for private companies)
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

The database includes major technology companies across segments:

### Software & Cloud

**Cloud & Infrastructure**: Microsoft, Amazon (AWS), Google Cloud, Oracle, IBM, Snowflake, MongoDB, Cloudflare, Nutanix, CoreWeave

**Cybersecurity**: Palo Alto Networks, CrowdStrike, Fortinet, Zscaler, SentinelOne, Okta, Qualys, Tenable, Rapid7, Varonis, CyberArk, Check Point

**Enterprise Software**: Salesforce, SAP, ServiceNow, Workday, Intuit, Adobe, Autodesk

**Data & Analytics**: Palantir, Datadog, Splunk, Teradata, Confluent, Elastic, Domo, Amplitude

**DevOps & Development**: Atlassian, GitLab, JFrog, HashiCorp, Dynatrace

**HR & Payroll**: Workday, Paycom, Paylocity, Dayforce (Ceridian)

**CRM & Marketing**: Salesforce, HubSpot, Klaviyo, Braze, Sprinklr, Sprout Social

**Collaboration**: Zoom, Twilio, DocuSign, Box, Dropbox, Five9, Freshworks

**Design & Engineering**: Autodesk, ANSYS, Synopsys, Cadence, PTC, Altair, Bentley Systems, Aspen Technology, Figma

**Vertical Software**: Veeva (life sciences), Guidewire (insurance), Procore (construction), Tyler Technologies (government), nCino (banking), Blackbaud (nonprofits), ServiceTitan (home services)

### Consumer & Digital Platforms

**Streaming & Entertainment**: Netflix, Spotify, Roku

**Social Media**: Snap, Pinterest, Reddit, Meta

**Gaming**: Roblox, Electronic Arts, Take-Two Interactive, Unity Software

**E-commerce**: Etsy, eBay, Chewy, Wayfair, Shopify, Amazon, Coupang

**Delivery & Gig Economy**: DoorDash, Uber, Lyft, Instacart

**Electric Vehicles**: Tesla, Rivian, Lucid Motors

**Travel Tech**: Airbnb, Booking Holdings, Expedia, Navan

### Fintech & Payments

**Payments & Fintech**: PayPal, Block (Square), Affirm, Robinhood, SoFi, Coinbase, Chime, Klarna

**Crypto & Blockchain**: Circle (USDC)

**Financial Software**: Bill Holdings, BlackLine, Zuora, FICO, Payoneer, WEX

### Health Tech

**Digital Health**: Teladoc, Doximity, GoodRx, Tempus AI

### Real Estate Tech

**PropTech**: Zillow, Redfin, CoStar Group

### Hardware & Infrastructure

**Networking & Infrastructure**: Arista Networks, F5, Akamai, NetApp, Pure Storage, Broadcom, Dell Technologies, Motorola Solutions, Zebra Technologies

**Semiconductors**: NVIDIA, Intel, AMD, ARM Holdings, Astera Labs

**Ad Tech & IoT**: The Trade Desk, AppLovin, Samsara

### Services & Other

**IT Services & Consulting**: Accenture, Cognizant, Globant, Gartner

**Data Management**: Informatica, Trimble, Rubrik

**Consumer Tech**: Duolingo, Gen Digital

**Diversified Tech**: Roper Technologies

## Site Features

### Home View

- Alphabetically sorted list of companies
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
├── server.js           # Node.js static file server
├── package.json        # Node.js project configuration
├── railway.json        # Railway deployment configuration
└── README.md           # This file
```

### Running Locally

1. Compile the data (if JSON files have changed):
   ```bash
   npm run compile
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open http://localhost:8000

### Deployment

The site is configured for Railway deployment:
- Push to GitHub
- Connect repository to Railway
- Railway automatically builds and deploys

### Technologies

- Vanilla HTML, CSS, JavaScript (no frameworks)
- Node.js for data compilation and serving
- Inter and IBM Plex Mono fonts

## Data Sources

Competitive intelligence was compiled from:
- SEC filings (10-K, 10-Q reports)
- Company investor presentations
- Industry analyst reports (Gartner, Forrester, IDC)
- Market research publications
- Business news and press releases

## Use Cases

- **Investment Research**: Understand competitive positioning
- **Market Analysis**: Track how competitive landscapes evolve
- **Business Development**: Identify potential partners or acquisition targets
- **Strategic Planning**: Map competitive threats and opportunities

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
