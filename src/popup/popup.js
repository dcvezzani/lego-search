document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const loadingElement = document.getElementById('loading');

    // API configuration
    const REBRICKABLE_API_BASE = process.env.REBRICKABLE_API_BASE || 'https://rebrickable.com/api/v3/lego';
    let apiKey = process.env.REBRICKABLE_API_KEY || '';

    // Load API key from storage (fallback if not in env)
    if (!apiKey) {
        chrome.storage.sync.get(['rebrickableApiKey'], (result) => {
            apiKey = result.rebrickableApiKey;
            if (!apiKey) {
                showApiKeyPrompt();
            }
        });
    }

    // Event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
        if (e.target.id === 'saveApiKey') {
            const apiKeyInput = document.getElementById('apiKeyInput');
            const newApiKey = apiKeyInput?.value.trim();
            if (newApiKey) {
                chrome.storage.sync.set({ rebrickableApiKey: newApiKey }, () => {
                    apiKey = newApiKey;
                    resultsContainer.innerHTML = '';
                });
            }
        }
    });

    function showApiKeyPrompt() {
        resultsContainer.innerHTML = `
            <div class="api-key-prompt">
                <p>Please enter your Rebrickable API key to use this extension.</p>
                <input type="text" id="apiKeyInput" placeholder="Enter API key...">
                <button id="saveApiKey">Save API Key</button>
                <p class="help-text">
                    <a href="https://rebrickable.com/api/" target="_blank" rel="noopener noreferrer">
                        Get an API key from Rebrickable
                    </a>
                </p>
            </div>
        `;
    }

    async function searchBricks(query) {
        if (!apiKey) {
            showApiKeyPrompt();
            return;
        }

        loadingElement.classList.remove('hidden');
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch(`${REBRICKABLE_API_BASE}/parts/?search=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `key ${apiKey}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            displayResults(data.results.slice(0, 25));
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    Error searching for bricks. Please try again.
                </div>
            `;
        } finally {
            loadingElement.classList.add('hidden');
        }
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    No bricks found. Try a different search term.
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(brick => `
            <div class="result-item">
                <img 
                    class="result-image" 
                    src="${brick.part_img_url || 'placeholder-image.png'}" 
                    alt="${brick.name}"
                    loading="lazy"
                >
                <div class="result-info">
                    <div class="result-title">${brick.name}</div>
                    <div class="result-details">
                        Part #: ${brick.part_num}<br>
                        <a href="${brick.part_url}" target="_blank" rel="noopener noreferrer">View on Rebrickable</a>
                    </div>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHtml;
    }

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchBricks(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchBricks(query);
            }
        }
    });
}); 