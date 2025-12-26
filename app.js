/**
 * Software Sector Competitive Intelligence
 * Clean, information-first interface
 */

const state = {
    filter: 'public',
    industry: '',
    currentEntity: null,
    selectedYear: null,
    currentPage: 1,
    perPage: 20
};

const entityMap = new Map();

// Initialize
function init() {
    // Show loading state
    showLoading();

    // Use setTimeout to allow the loading UI to render
    setTimeout(() => {
        COMPETITOR_DATA.entities.forEach(entity => {
            entityMap.set(entity.slug, entity);
        });

        populateIndustryFilter();
        setupEventListeners();
        renderCompanyList();
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);

        // Hide loading
        hideLoading();
    }, 10);
}

function showLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.classList.add('active');
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.classList.remove('active');
}

// Populate industry dropdown
function populateIndustryFilter() {
    const industries = new Set();
    Object.values(COMPETITOR_DATA.industries).forEach(list => {
        list.forEach(i => industries.add(i));
    });

    const select = document.getElementById('industryFilter');
    Array.from(industries).sort().forEach(industry => {
        const option = document.createElement('option');
        option.value = industry;
        option.textContent = industry;
        select.appendChild(option);
    });
}

// Event listeners
function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.filter = tab.dataset.filter;
            state.currentPage = 1;
            renderCompanyList();
        });
    });

    // Industry filter
    document.getElementById('industryFilter').addEventListener('change', (e) => {
        state.industry = e.target.value;
        state.currentPage = 1;
        renderCompanyList();
    });

    // Search
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const results = COMPETITOR_DATA.entities
            .filter(entity =>
                entity.name.toLowerCase().includes(query) ||
                (entity.ticker && entity.ticker.toLowerCase().includes(query))
            )
            .slice(0, 8);

        if (results.length > 0) {
            searchResults.innerHTML = results.map(entity => `
                <div class="search-result" data-slug="${encodeURIComponent(entity.slug)}">
                    <span>${entity.name}</span>
                    ${entity.ticker ? `<span class="ticker">${entity.ticker}</span>` : ''}
                </div>
            `).join('');
            searchResults.querySelectorAll('.search-result').forEach(item => {
                // Use mousedown instead of click - fires before blur
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // Prevent blur from firing
                    navigateToEntity(decodeURIComponent(item.dataset.slug));
                    searchResults.classList.remove('active');
                    searchInput.value = '';
                });
            });
            searchResults.classList.add('active');
        } else {
            searchResults.classList.remove('active');
        }
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => searchResults.classList.remove('active'), 200);
    });

    // Parent company link
    const parentLink = document.getElementById('parentCompanyLink');
    if (parentLink) {
        parentLink.addEventListener('click', () => {
            const slug = parentLink.dataset.slug;
            if (slug) navigateToEntity(slug);
        });
    }
}

// Render company list with pagination
function renderCompanyList() {
    let entities = [...COMPETITOR_DATA.entities];

    // Filter
    if (state.filter === 'public') {
        entities = entities.filter(e => e.isPublic);
    }

    // Industry filter
    if (state.industry) {
        entities = entities.filter(e => {
            const industries = COMPETITOR_DATA.industries[e.slug] || [];
            return industries.includes(state.industry);
        });
    }

    // Sort alphabetically
    entities.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const totalPages = Math.ceil(entities.length / state.perPage);
    if (state.currentPage > totalPages) state.currentPage = 1;
    const start = (state.currentPage - 1) * state.perPage;
    const end = start + state.perPage;
    const pageEntities = entities.slice(start, end);

    const container = document.getElementById('companyList');
    container.innerHTML = pageEntities.map(entity => `
        <div class="company-row" data-slug="${encodeURIComponent(entity.slug)}">
            <span class="company-name">${entity.name}</span>
            ${entity.ticker ? `<span class="company-ticker">${entity.ticker}</span>` : ''}
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.company-row').forEach(row => {
        row.addEventListener('click', () => {
            navigateToEntity(decodeURIComponent(row.dataset.slug));
        });
    });

    // Render pagination
    renderPagination(entities.length, totalPages);
}

// Render pagination controls
function renderPagination(totalItems, totalPages) {
    let paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination';
        paginationContainer.className = 'pagination';
        document.getElementById('companyList').after(paginationContainer);
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    const pages = [];
    const current = state.currentPage;

    // Always show first page
    pages.push(1);

    // Show ellipsis and nearby pages
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
    }
    if (current < totalPages - 2) pages.push('...');

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    paginationContainer.innerHTML = `
        <button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="goToPage(${current - 1})">←</button>
        ${pages.map(p => p === '...'
            ? '<span class="page-ellipsis">…</span>'
            : `<button class="page-btn ${p === current ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`
        ).join('')}
        <button class="page-btn" ${current === totalPages ? 'disabled' : ''} onclick="goToPage(${current + 1})">→</button>
        <span class="page-info">${totalItems} companies</span>
    `;
}

// Go to specific page
function goToPage(page) {
    state.currentPage = page;
    renderCompanyList();
    window.scrollTo(0, 0);
}

// Navigation
function navigateToEntity(slug) {
    window.location.hash = slug;
}

function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && entityMap.has(hash)) {
        showEntity(hash);
    } else {
        showHome();
    }
}

function showHome() {
    window.location.hash = '';
    document.getElementById('homeView').classList.add('active');
    document.getElementById('entityView').classList.remove('active');
    state.currentEntity = null;
}

// Show entity detail
function showEntity(slug) {
    const entity = entityMap.get(slug);
    if (!entity) return;

    state.currentEntity = entity;

    // Header
    document.getElementById('entityName').textContent = entity.name;

    const tickerEl = document.getElementById('entityTicker');
    if (entity.ticker) {
        tickerEl.textContent = entity.ticker;
        tickerEl.style.display = '';
    } else {
        tickerEl.style.display = 'none';
    }

    // Entity type and ownership badges
    const entityTypeEl = document.getElementById('entityType');
    const entityType = entity.entityType || 'unknown';

    if (entityType === 'product' || entityType === 'division') {
        entityTypeEl.textContent = entityType === 'division' ? 'Division' : 'Product';
        entityTypeEl.className = 'type-badge product';
    } else if (entity.isPublic) {
        entityTypeEl.textContent = 'Public Company';
        entityTypeEl.className = 'type-badge public';
    } else if (entity.ownership === 'private') {
        entityTypeEl.textContent = 'Private Company';
        entityTypeEl.className = 'type-badge private';
    } else {
        entityTypeEl.textContent = 'Entity';
        entityTypeEl.className = 'type-badge';
    }

    // Parent company link for products
    const parentSection = document.getElementById('parentCompanySection');
    if (parentSection) {
        if (entity.parentCompany && entity.parentSlug) {
            document.getElementById('parentCompanyName').textContent = entity.parentCompany;
            document.getElementById('parentCompanyLink').dataset.slug = entity.parentSlug;
            parentSection.style.display = '';
        } else {
            parentSection.style.display = 'none';
        }
    }

    // Financial stats - will be updated per year
    updateFinancialStats(entity, null);

    // Stats
    document.getElementById('statCompetitors').textContent = entity.competitors?.length || 0;
    document.getElementById('statYears').textContent = entity.years ? Object.keys(entity.years).length : 0;
    document.getElementById('statCitations').textContent = entity.mentionedBy.length;

    // Industries
    const industries = COMPETITOR_DATA.industries[slug] || [];
    const industriesSection = document.getElementById('industriesSection');
    const industriesList = document.getElementById('industriesList');

    if (industries.length > 0) {
        industriesList.innerHTML = industries.map(i => `<span class="industry-tag">${i}</span>`).join('');
        industriesSection.style.display = '';
    } else {
        industriesSection.style.display = 'none';
    }

    // Year selector
    renderYearSelector(entity);

    // Competitors summary
    renderCompetitorsSummary(entity);

    // Citations
    renderCitations(entity);

    // Show view
    document.getElementById('homeView').classList.remove('active');
    document.getElementById('entityView').classList.add('active');
    window.scrollTo(0, 0);
}

// Render year selector
function renderYearSelector(entity) {
    const container = document.getElementById('yearSelector');
    const contentContainer = document.getElementById('yearContent');

    if (!entity.years || Object.keys(entity.years).length === 0) {
        container.innerHTML = '';

        // Show notes for non-public entities
        if (entity.notes && Object.keys(entity.notes).length > 0) {
            const years = Object.keys(entity.notes).sort((a, b) => parseInt(b) - parseInt(a));
            container.innerHTML = years.map((year, i) => `
                <button class="year-tab ${i === 0 ? 'active' : ''}" data-year="${year}">${year}</button>
            `).join('') + '<span class="more-years">+ more coming</span>';

            state.selectedYear = years[0];
            renderYearContentForNonPublic(entity, years[0]);

            container.querySelectorAll('.year-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    container.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    state.selectedYear = tab.dataset.year;
                    renderYearContentForNonPublic(entity, tab.dataset.year);
                });
            });
        } else {
            contentContainer.innerHTML = '<p class="no-data">No timeline data available.</p>';
        }
        return;
    }

    const years = Object.keys(entity.years).sort((a, b) => parseInt(b) - parseInt(a));

    container.innerHTML = years.map((year, i) => `
        <button class="year-tab ${i === 0 ? 'active' : ''}" data-year="${year}">${year}</button>
    `).join('') + '<span class="more-years">+ more coming</span>';

    // Set initial year
    state.selectedYear = years[0];
    renderYearContent(entity, years[0]);
    updateFinancialStats(entity, years[0]);

    // Year tab clicks
    container.querySelectorAll('.year-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.selectedYear = tab.dataset.year;
            renderYearContent(entity, tab.dataset.year);
            updateFinancialStats(entity, tab.dataset.year);
        });
    });
}

// Render year content
function renderYearContent(entity, year) {
    const data = entity.years[year];
    const container = document.getElementById('yearContent');

    container.innerHTML = `
        ${data.context ? `<div class="year-context">${data.context}</div>` : ''}

        <div class="competitors-for-year">
            <h3>Competitors in ${year}</h3>
            ${data.competitors.map(comp => {
                const compSlug = createSlug(comp.name);
                const compEntity = entityMap.get(compSlug);
                const entityType = compEntity?.entityType || 'unknown';
                const isProduct = entityType === 'product' || entityType === 'division';
                const isPublic = compEntity?.isPublic || false;

                // Get year-specific financials
                const yearFin = getCompetitorFinancials(compSlug, year);
                const revenueDisplay = yearFin?.revenue || yearFin?.revenue_2024 || null;
                const mcDisplay = yearFin?.market_cap || null;

                const badgeClass = isProduct ? 'competitor-product' : (isPublic ? 'competitor-public' : '');
                const badgeText = isProduct ? (entityType === 'division' ? 'Division' : 'Product') : (isPublic ? 'Public' : '');

                return `
                    <div class="competitor-item ${isProduct ? 'is-product' : ''}" data-slug="${encodeURIComponent(compSlug)}">
                        <div class="competitor-header">
                            <span class="competitor-name">${comp.name}</span>
                            ${badgeText ? `<span class="${badgeClass}">${badgeText}</span>` : ''}
                            ${revenueDisplay ? `<span class="competitor-revenue">${revenueDisplay}</span>` : ''}
                            ${mcDisplay ? `<span class="competitor-mcap">${mcDisplay}</span>` : ''}
                        </div>
                        ${comp.notes ? `<p class="competitor-notes">${comp.notes}</p>` : ''}
                        ${isProduct && compEntity?.parentCompany ? `<p class="competitor-parent">Product of ${compEntity.parentCompany}</p>` : ''}
                    </div>
                `;
            }).join('')}
        </div>

        ${data.sources && data.sources.length > 0 ? `
            <div class="sources-section">
                <h3>Sources</h3>
                ${data.sources.map(url => {
                    const domain = extractDomain(url);
                    return `<a href="${url}" target="_blank" rel="noopener" class="source-link">${domain} ↗</a>`;
                }).join('')}
            </div>
        ` : ''}
    `;

    // Add click handlers for competitor items
    container.querySelectorAll('.competitor-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateToEntity(decodeURIComponent(item.dataset.slug));
        });
    });
}

// Render year content for non-public entities
function renderYearContentForNonPublic(entity, year) {
    const notes = entity.notes[year];
    const container = document.getElementById('yearContent');

    container.innerHTML = `
        <div class="competitors-for-year">
            <h3>References in ${year}</h3>
            ${notes.map(n => `
                <div class="competitor-item" data-slug="${encodeURIComponent(createSlug(n.from))}">
                    <div class="competitor-header">
                        <span class="competitor-name">${n.from}</span>
                        <span class="competitor-public">Source</span>
                    </div>
                    ${n.note ? `<p class="competitor-notes">${n.note}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;

    // Add click handlers
    container.querySelectorAll('.competitor-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateToEntity(decodeURIComponent(item.dataset.slug));
        });
    });
}

// Render all competitors summary
function renderCompetitorsSummary(entity) {
    const container = document.getElementById('competitorsList');
    const section = document.getElementById('competitorsSection');
    const competitors = entity.competitors || [];

    if (competitors.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';

    // Sort: companies by market cap (highest first), products at end
    const sorted = [...competitors].sort((a, b) => {
        const aIsProduct = a.entityType === 'product' || a.entityType === 'division';
        const bIsProduct = b.entityType === 'product' || b.entityType === 'division';
        if (aIsProduct !== bIsProduct) return aIsProduct ? 1 : -1;
        const aMcap = a.financials?.market_cap_raw || 0;
        const bMcap = b.financials?.market_cap_raw || 0;
        if (aMcap !== bMcap) return bMcap - aMcap;
        return a.name.localeCompare(b.name);
    });

    container.innerHTML = sorted.map(comp => {
        const typeClass = comp.entityType === 'product' || comp.entityType === 'division'
            ? 'chip-product'
            : (comp.isPublic ? 'chip-public' : '');
        const revenueLabel = comp.financials?.revenue_2024
            ? `<span class="chip-revenue">${comp.financials.revenue_2024}</span>`
            : '';
        return `
            <div class="competitor-chip ${typeClass}" data-slug="${encodeURIComponent(comp.slug)}">
                <span class="chip-name">${comp.name}</span>
                ${comp.ticker ? `<span class="chip-ticker">${comp.ticker}</span>` : ''}
                ${revenueLabel}
            </div>
        `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.competitor-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            navigateToEntity(decodeURIComponent(chip.dataset.slug));
        });
    });
}

// Render citations
function renderCitations(entity) {
    const container = document.getElementById('citationsList');
    const section = document.getElementById('citationsSection');
    const mentions = entity.mentionedBy || [];

    if (mentions.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';

    // Group by company
    const grouped = {};
    mentions.forEach(m => {
        if (!grouped[m.slug]) {
            grouped[m.slug] = { ...m, years: [] };
        }
        grouped[m.slug].years.push(m.year);
    });

    const sorted = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));

    container.innerHTML = sorted.map(m => `
        <div class="citation-item" data-slug="${encodeURIComponent(m.slug)}">
            <span class="citation-company">${m.name}</span>
            <span class="citation-years">${m.years.sort().join(', ')}</span>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.citation-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateToEntity(decodeURIComponent(item.dataset.slug));
        });
    });
}

// Update financial stats for a given year
function updateFinancialStats(entity, year) {
    const financialSection = document.getElementById('financialStats');
    const revLabel = document.querySelector('#financialStats .financial-label');

    if (!financialSection) return;

    // Try to get year-specific financials first
    let yearFin = null;
    if (year && entity.financialsByYear && entity.financialsByYear[year]) {
        yearFin = entity.financialsByYear[year];
    }

    // Fall back to latest financials if no year-specific data
    const fin = yearFin || entity.financials;

    if (fin && (fin.revenue || fin.revenue_2024 || fin.market_cap)) {
        const revenue = fin.revenue || fin.revenue_2024 || 'N/A';
        const marketCap = fin.market_cap || 'N/A';

        document.getElementById('statRevenue').textContent = revenue;
        document.getElementById('statMarketCap').textContent = marketCap;

        // Update label to show year
        if (revLabel) {
            revLabel.textContent = year ? `Revenue (${year})` : 'Revenue (Latest)';
        }

        financialSection.style.display = '';
    } else {
        financialSection.style.display = 'none';
    }
}

// Get year-specific financials for a competitor
function getCompetitorFinancials(compSlug, year) {
    const compEntity = entityMap.get(compSlug);
    if (!compEntity) return null;

    // Try year-specific first
    if (year && compEntity.financialsByYear && compEntity.financialsByYear[year]) {
        return compEntity.financialsByYear[year];
    }

    // Fall back to latest
    return compEntity.financials;
}

// Utilities
function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\b(inc|corp|corporation|ltd|llc|co|company|technologies|technology|software|systems|holdings|group|plc|nv|sa)\b/gi, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function extractDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', init);
