console.log('Explainx content script loaded!');

// Extract text content from the webpage
function extractPageText() {
    // Get the main content, avoiding scripts, styles, and other non-content elements
    const body = document.body.cloneNode(true);

    // Remove unwanted elements
    const unwantedSelectors = ['script', 'style', 'noscript', 'iframe', 'nav', 'header', 'footer', '.ad', '#explainx-container'];
    unwantedSelectors.forEach(selector => {
        const elements = body.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });

    // Get text content
    const text = body.innerText || body.textContent || '';

    // Clean up the text
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
        .trim();
}

// Create and inject the circular button
function createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'explainx-floating-btn';
    button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  `;
    button.title = 'Summarize this page with Explainx';

    button.addEventListener('click', () => {
        showSummaryDialog();
    });

    document.body.appendChild(button);
    return button;
}

// Create the summary dialog
function createSummaryDialog() {
    const container = document.createElement('div');
    container.id = 'explainx-container';

    const overlay = document.createElement('div');
    overlay.id = 'explainx-overlay';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeSummaryDialog();
        }
    });

    const dialog = document.createElement('div');
    dialog.id = 'explainx-dialog';
    dialog.innerHTML = `
    <div class="explainx-header">
      <h2>Page Summary</h2>
      <button id="explainx-close" class="explainx-icon-btn" title="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="explainx-content">
      <div id="explainx-summary-text" class="explainx-summary-text">
        Loading page content...
      </div>
    </div>
    <div class="explainx-footer">
      <button id="explainx-regenerate" class="explainx-btn explainx-btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Re-generate
      </button>
      <button id="explainx-discard" class="explainx-btn explainx-btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Discard
      </button>
      <button id="explainx-save" class="explainx-btn explainx-btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Save
      </button>
    </div>
  `;

    overlay.appendChild(dialog);
    container.appendChild(overlay);
    document.body.appendChild(container);

    // Attach event listeners
    document.getElementById('explainx-close').addEventListener('click', closeSummaryDialog);
    document.getElementById('explainx-discard').addEventListener('click', closeSummaryDialog);
    document.getElementById('explainx-save').addEventListener('click', saveSummary);
    document.getElementById('explainx-regenerate').addEventListener('click', regenerateSummary);

    return container;
}

// Show the summary dialog
function showSummaryDialog() {
    let container = document.getElementById('explainx-container');

    if (!container) {
        container = createSummaryDialog();
    }

    container.style.display = 'block';

    // Check if API key is configured
    try {
        chrome.storage.local.get(['openai_api_key'], (result) => {
            if (chrome.runtime.lastError) {
                console.log('Extension context invalidated, using fallback');
                generateSimpleSummary();
                return;
            }

            const apiKey = result.openai_api_key;

            if (apiKey && apiKey.trim()) {
                // Use AI summarization
                generateAISummary(apiKey);
            } else {
                // Fallback to simple text extraction
                generateSimpleSummary();
            }
        });
    } catch (error) {
        console.log('Storage access failed, using fallback');
        generateSimpleSummary();
    }
}

// Generate AI summary using OpenAI
async function generateAISummary(apiKey) {
    const summaryElement = document.getElementById('explainx-summary-text');
    summaryElement.textContent = 'Generating AI summary...';
    summaryElement.classList.add('loading');

    try {
        const pageText = extractPageText();

        if (!pageText || pageText.length < 100) {
            summaryElement.textContent = 'Unable to extract sufficient text content from this page.';
            summaryElement.classList.remove('loading');
            summaryElement.classList.add('error');
            return;
        }

        // Truncate text if too long (OpenAI has token limits)
        const maxLength = 15000; // Roughly 4000 tokens
        const textToSummarize = pageText.length > maxLength
            ? pageText.substring(0, maxLength) + '...'
            : pageText;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that summarizes web page content. Provide clear, concise summaries that capture the main points and key information.'
                    },
                    {
                        role: 'user',
                        content: `Please summarize the following webpage content:\n\n${textToSummarize}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const summary = data.choices[0].message.content;

        summaryElement.textContent = summary;
        summaryElement.classList.remove('loading');

    } catch (error) {
        console.error('AI summarization error:', error);
        summaryElement.textContent = `AI Summarization Failed: ${error.message}\n\nFalling back to raw text extraction...`;
        summaryElement.classList.remove('loading');
        summaryElement.classList.add('error');

        // Fallback to simple text after a delay
        setTimeout(() => {
            generateSimpleSummary();
        }, 2000);
    }
}

// Generate simple text summary (fallback)
function generateSimpleSummary() {
    const pageText = extractPageText();
    const summaryElement = document.getElementById('explainx-summary-text');

    if (pageText && pageText.length > 100) {
        summaryElement.textContent = pageText;
        summaryElement.classList.remove('loading', 'error');
    } else {
        summaryElement.textContent = 'Unable to extract sufficient text content from this page.';
        summaryElement.classList.remove('loading');
        summaryElement.classList.add('error');
    }
}

// Close the summary dialog
function closeSummaryDialog() {
    const container = document.getElementById('explainx-container');
    if (container) {
        container.style.display = 'none';
    }
}

// Save summary to storage
function saveSummary() {
    const summaryText = document.getElementById('explainx-summary-text').textContent;
    const pageTitle = document.title;
    const pageUrl = window.location.href;

    if (!summaryText || summaryText.includes('Loading') || summaryText.includes('Unable to extract')) {
        alert('Cannot save an invalid summary.');
        return;
    }

    const summary = {
        id: Date.now(),
        title: pageTitle,
        url: pageUrl,
        text: summaryText.substring(0, 500) + (summaryText.length > 500 ? '...' : ''),
        fullText: summaryText,
        timestamp: new Date().toISOString()
    };

    // Save to Chrome storage
    try {
        chrome.storage.local.get(['summaries'], (result) => {
            if (chrome.runtime.lastError) {
                alert('Cannot save: Extension was reloaded. Please refresh this page.');
                return;
            }

            const summaries = result.summaries || [];
            summaries.unshift(summary);

            // Keep only the last 50 summaries
            if (summaries.length > 50) {
                summaries.pop();
            }

            chrome.storage.local.set({ summaries }, () => {
                if (chrome.runtime.lastError) {
                    alert('Cannot save: Extension was reloaded. Please refresh this page.');
                    return;
                }
                showNotification('Summary saved successfully!');
                closeSummaryDialog();
            });
        });
    } catch (error) {
        alert('Cannot save: Extension was reloaded. Please refresh this page.');
    }
}

// Regenerate summary
function regenerateSummary() {
    const summaryElement = document.getElementById('explainx-summary-text');
    summaryElement.textContent = 'Regenerating...';
    summaryElement.classList.add('loading');
    summaryElement.classList.remove('error');

    // Check if API key is configured
    try {
        chrome.storage.local.get(['openai_api_key'], (result) => {
            if (chrome.runtime.lastError) {
                console.log('Extension context invalidated, using fallback');
                setTimeout(() => {
                    generateSimpleSummary();
                    showNotification('Content regenerated!');
                }, 500);
                return;
            }

            const apiKey = result.openai_api_key;

            if (apiKey && apiKey.trim()) {
                // Use AI summarization
                generateAISummary(apiKey);
                showNotification('Regenerating AI summary...');
            } else {
                // Fallback to simple text extraction
                setTimeout(() => {
                    generateSimpleSummary();
                    showNotification('Content regenerated!');
                }, 500);
            }
        });
    } catch (error) {
        console.log('Storage access failed, using fallback');
        setTimeout(() => {
            generateSimpleSummary();
            showNotification('Content regenerated!');
        }, 500);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'explainx-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// Initialize the extension
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
} else {
    createFloatingButton();
}
