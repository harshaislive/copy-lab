// Copy Lab App - 10% Content Generator
const API_URL = 'api/copy.json';
let currentSnippet = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Refresh every 30 seconds
    setInterval(loadData, 30000);
});

// Load data from API
async function loadData() {
    try {
        const response = await fetch(API_URL + '?t=' + Date.now());
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Failed to load data:', error);
        // Use mock data if API fails
        updateUI(getMockData());
    }
}

// Update UI with data
function updateUI(data) {
    // Stats
    const stats = data.stats || {};
    document.getElementById('total-snippets').textContent = stats.total || 0;
    document.getElementById('draft-count').textContent = stats.drafts || 0;
    document.getElementById('posted-count').textContent = stats.posted || 0;
    document.getElementById('avg-engagement').textContent = 
        Math.round(stats.avg_engagement || 0) + '%';
    
    // Latest copy
    const snippets = data.snippets || [];
    if (snippets.length > 0) {
        currentSnippet = snippets[0];
        displaySnippet(currentSnippet);
        displayAllSnippets(snippets);
    }
    
    // LinkedIn tracker
    updateLinkedInTracker(data.linkedin_posts || []);
    
    // Insights
    updateInsights(data.learning_data || {});
    
    // Last update
    document.getElementById('last-update').textContent = 
        'Last update: ' + new Date().toLocaleTimeString();
}

// Display single snippet
function displaySnippet(snippet) {
    document.getElementById('copy-text').textContent = snippet.copy_text;
    document.getElementById('engagement-score').textContent = 
        'Engagement: ' + snippet.engagement_prediction + '%';
    
    // Justification
    const justEl = document.getElementById('justification');
    if (snippet.justification) {
        justEl.textContent = snippet.justification.substring(0, 300) + '...';
    }
    
    // Trends
    const trendsEl = document.getElementById('trends');
    if (snippet.themes) {
        trendsEl.innerHTML = snippet.themes
            .map(t => `<li>${t}</li>`)
            .join('');
    }
    
    // Language DNA bars
    const dnaContainer = document.getElementById('dna-bars');
    if (dnaContainer) {
        // Get style breakdown from stats
        const styleBreakdown = snippet.language_dna || {};
        const type = snippet.copy_type || '';
        
        let phil = 0, tribal = 0, conf = 0;
        
        if (type.includes('philosophical')) phil = 100;
        else if (type.includes('tribal')) tribal = 100;
        else if (type.includes('confrontational')) conf = 100;
        else phil = 33; tribal = 33; conf = 34; // Default split
        
        dnaContainer.innerHTML = `
            <div class="dna-row">
                <span>Philosophical</span>
                <div class="bar"><div class="fill" style="width: ${phil}%"></div></div>
                <span>${phil}%</span>
            </div>
            <div class="dna-row">
                <span>Tribal</span>
                <div class="bar"><div class="fill" style="width: ${tribal}%"></div></div>
                <span>${tribal}%</span>
            </div>
            <div class="dna-row">
                <span>Confrontational</span>
                <div class="bar"><div class="fill" style="width: ${conf}%"></div></div>
                <span>${conf}%</span>
            </div>
        `;
    }
}

// Display all snippets
function displayAllSnippets(snippets) {
    const container = document.getElementById('snippets-list');
    
    if (snippets.length === 0) {
        container.innerHTML = '<div class="snippet-item empty">No snippets yet</div>';
        return;
    }
    
    container.innerHTML = snippets.slice(0, 10).map(s => `
        <div class="snippet-item">
            <p class="snippet-preview">${s.copy_text.substring(0, 120)}...</p>
            <div class="snippet-meta">
                <span>Type: ${s.copy_type}</span>
                <span>Engagement: ${s.engagement_prediction}%</span>
                <span>Status: ${s.status}</span>
            </div>
        </div>
    `).join('');
}

// Update LinkedIn tracker
function updateLinkedInTracker(posts) {
    const container = document.getElementById('linkedin-tracker');
    
    if (posts.length === 0) {
        // Keep empty state
        return;
    }
    
    let html = `
        <div class="tracker-header">
            <span>Date</span>
            <span>Type</span>
            <span>Likes</span>
            <span>Comments</span>
            <span>Shares</span>
            <span>Score</span>
        </div>
    `;
    
    posts.forEach(post => {
        html += `
            <div class="tracker-row">
                <span>${post.date}</span>
                <span>${post.type}</span>
                <span>${post.likes}</span>
                <span>${post.comments}</span>
                <span>${post.shares}</span>
                <span>${post.score}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update insights
function updateInsights(learning) {
    const patternsEl = document.getElementById('best-patterns');
    if (patternsEl && learning.high_performing_patterns) {
        patternsEl.innerHTML = learning.high_performing_patterns
            .map(p => `<li>${p}</li>`)
            .join('') || '<li>Collecting data...</li>';
    }
}

// Copy to clipboard
function copyToClipboard() {
    if (!currentSnippet) return;
    
    navigator.clipboard.writeText(currentSnippet.copy_text).then(() => {
        const btn = document.querySelector('.btn-primary');
        const original = btn.innerHTML;
        btn.innerHTML = '<span>✓</span> COPIED!';
        setTimeout(() => {
            btn.innerHTML = original;
        }, 2000);
    });
}

// Generate new copy (trigger agent)
function generateNew() {
    const btn = document.querySelector('.btn-secondary');
    btn.innerHTML = '<span>⏳</span> GENERATING...';
    btn.disabled = true;
    
    // Simulate generation (in real implementation, would trigger backend)
    setTimeout(() => {
        btn.innerHTML = '<span>✨</span> GENERATE NEW';
        btn.disabled = false;
        loadData(); // Refresh to show new data
    }, 2000);
}

// Mock data fallback
function getMockData() {
    return {
        stats: {
            total: 6,
            drafts: 6,
            posted: 0,
            avg_engagement: 80
        },
        snippets: [
            {
                id: 'copy_001',
                copy_type: 'tribal_manifesto',
                copy_text: `We are the ones who know that silence is the real luxury.

You don't need more time. You need deeper presence.

This requires showing up. Not just buying in.

Stop running. Start seeing.`,
                justification: 'LANGUAGE DNA APPLIED:\n• Template: Tribal Manifesto\n• Tribal call: Identity-based positioning\n• Truth delivery: 10% philosophy core\n• Exclusion: Filters wrong audience',
                themes: ['sustainable living', '10% lifestyle', 'wilderness philosophy'],
                engagement_prediction: 82,
                status: 'draft',
                language_dna: {
                    template_type: 'tribal_manifesto'
                }
            }
        ],
        linkedin_posts: [],
        learning_data: {
            high_performing_patterns: ['Tribal identity markers', 'Exclusion filters', 'Philosophical truths']
        }
    };
}
