#!/usr/bin/env node
/**
 * Compiles all competitor JSON files into a unified entity graph
 * with bidirectional cross-references
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'competitor_searches');
const OUTPUT_FILE = path.join(__dirname, 'data.js');

// Normalize company names for matching
function normalizeCompanyName(name) {
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(inc|corp|corporation|ltd|llc|co|company|technologies|technology|software|systems|holdings|group|plc|nv|sa)\b/gi, '')
    .trim();
}

// Create a slug from company name
function createSlug(name) {
  return normalizeCompanyName(name)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Main compilation
function compileData() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  // Entity maps
  const publicCompanies = new Map(); // ticker -> company data
  const allEntities = new Map(); // slug -> entity data
  const relationships = []; // { source, target, year, notes }

  console.log(`Processing ${files.length} JSON files...`);

  // First pass: Load all public companies
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const slug = createSlug(data.company);
    const ticker = data.ticker;

    if (!publicCompanies.has(ticker)) {
      publicCompanies.set(ticker, {
        slug,
        name: data.company,
        ticker,
        isPublic: true,
        years: {},
        mentionedBy: [],
        competitors: []
      });
    }

    // Add year data
    publicCompanies.get(ticker).years[data.year] = {
      query: data.search_query,
      date: data.search_date,
      context: data.context,
      sources: data.sources || [],
      competitors: data.competitors || []
    };
  }

  // Add public companies to all entities
  for (const [ticker, company] of publicCompanies) {
    allEntities.set(company.slug, company);
  }

  console.log(`Found ${publicCompanies.size} public companies`);

  // Second pass: Extract all competitor entities and relationships
  for (const [ticker, company] of publicCompanies) {
    for (const [year, yearData] of Object.entries(company.years)) {
      for (const competitor of yearData.competitors) {
        const competitorSlug = createSlug(competitor.name);

        // Find if this competitor is a public company
        let competitorEntity = null;
        for (const [t, c] of publicCompanies) {
          if (c.slug === competitorSlug || normalizeCompanyName(c.name) === normalizeCompanyName(competitor.name)) {
            competitorEntity = c;
            break;
          }
        }

        // If not found, create as non-public entity
        if (!competitorEntity) {
          if (!allEntities.has(competitorSlug)) {
            allEntities.set(competitorSlug, {
              slug: competitorSlug,
              name: competitor.name,
              ticker: null,
              isPublic: false,
              mentionedBy: [],
              competitors: [],
              notes: {}
            });
          }
          competitorEntity = allEntities.get(competitorSlug);
        }

        // Add relationship
        relationships.push({
          source: company.slug,
          target: competitorEntity.slug,
          year: parseInt(year),
          notes: competitor.notes
        });

        // Track mentions
        if (!competitorEntity.mentionedBy.find(m => m.slug === company.slug && m.year === parseInt(year))) {
          competitorEntity.mentionedBy.push({
            slug: company.slug,
            name: company.name,
            ticker: company.ticker,
            year: parseInt(year),
            notes: competitor.notes
          });
        }

        // Track competitor notes for non-public entities
        if (!competitorEntity.isPublic) {
          if (!competitorEntity.notes[year]) {
            competitorEntity.notes[year] = [];
          }
          competitorEntity.notes[year].push({
            from: company.name,
            note: competitor.notes
          });
        }

        // Add to company's competitor list
        if (!company.competitors.find(c => c.slug === competitorEntity.slug)) {
          company.competitors.push({
            slug: competitorEntity.slug,
            name: competitorEntity.name,
            ticker: competitorEntity.ticker,
            isPublic: competitorEntity.isPublic
          });
        }
      }
    }
  }

  console.log(`Found ${allEntities.size} total entities`);
  console.log(`Found ${relationships.length} relationships`);

  // Build category/industry inference from context
  const industries = inferIndustries(publicCompanies);

  // Convert to arrays for output
  const output = {
    meta: {
      generated: new Date().toISOString(),
      totalEntities: allEntities.size,
      publicCompanies: publicCompanies.size,
      privateEntities: allEntities.size - publicCompanies.size,
      totalRelationships: relationships.length
    },
    entities: Array.from(allEntities.values()).sort((a, b) => {
      // Public companies first, then by mention count
      if (a.isPublic !== b.isPublic) return a.isPublic ? -1 : 1;
      return b.mentionedBy.length - a.mentionedBy.length;
    }),
    relationships,
    industries
  };

  // Write as JS module for easy browser loading
  const jsContent = `// Auto-generated competitor data
// Generated: ${output.meta.generated}
const COMPETITOR_DATA = ${JSON.stringify(output, null, 2)};

if (typeof module !== 'undefined') module.exports = COMPETITOR_DATA;
`;

  fs.writeFileSync(OUTPUT_FILE, jsContent);
  console.log(`\nWritten to ${OUTPUT_FILE}`);
  console.log(`  - ${output.meta.publicCompanies} public companies`);
  console.log(`  - ${output.meta.privateEntities} private/other entities`);
  console.log(`  - ${output.meta.totalRelationships} relationships`);
}

// Infer industries from company context
function inferIndustries(companies) {
  const industryKeywords = {
    'Cloud & Infrastructure': ['cloud', 'infrastructure', 'iaas', 'paas', 'hosting', 'cdn', 'edge'],
    'Cybersecurity': ['security', 'cybersecurity', 'endpoint', 'firewall', 'threat', 'malware', 'antivirus'],
    'Enterprise Software': ['erp', 'enterprise', 'business software', 'sap', 'oracle'],
    'Data & Analytics': ['data', 'analytics', 'warehouse', 'database', 'bi ', 'business intelligence'],
    'DevOps & Development': ['devops', 'developer', 'git', 'ci/cd', 'code', 'software development'],
    'HR & Payroll': ['payroll', 'hr ', 'human resources', 'hcm', 'workforce'],
    'CRM & Marketing': ['crm', 'marketing', 'customer', 'salesforce', 'hubspot'],
    'Financial Software': ['financial', 'accounting', 'fintech', 'payment', 'billing'],
    'Design & Engineering': ['cad', 'plm', 'simulation', 'design', 'engineering'],
    'Collaboration': ['collaboration', 'communication', 'video', 'meeting', 'document'],
    'AI & Machine Learning': ['ai ', 'artificial intelligence', 'machine learning', 'ml '],
    'Healthcare & Life Sciences': ['healthcare', 'life sciences', 'pharma', 'medical', 'clinical']
  };

  const companyIndustries = {};

  for (const [ticker, company] of companies) {
    const allText = Object.values(company.years)
      .map(y => (y.context || '').toLowerCase())
      .join(' ');

    const industries = [];
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(kw => allText.includes(kw))) {
        industries.push(industry);
      }
    }

    if (industries.length > 0) {
      companyIndustries[company.slug] = industries;
    }
  }

  return companyIndustries;
}

// Run
compileData();
