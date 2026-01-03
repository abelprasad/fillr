// DOM elements
const fillFormBtn = document.getElementById('fillFormBtn');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const profileForm = document.getElementById('profileForm');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const mainView = document.getElementById('mainView');
const historyView = document.getElementById('historyView');
const settingsView = document.getElementById('settingsView');

// History elements
const historyList = document.getElementById('historyList');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const totalAppsSpan = document.getElementById('totalApps');
const weekAppsSpan = document.getElementById('weekApps');

// AI/Settings elements
const generateCoverLetterBtn = document.getElementById('generateCoverLetterBtn');
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const testApiKeyBtn = document.getElementById('testApiKeyBtn');
const apiKeyStatusDiv = document.getElementById('apiKeyStatus');

// Profile field IDs
const profileFields = [
  'firstName', 'middleName', 'lastName', 'email', 'phone',
  'street', 'address2', 'city', 'state', 'zip', 'country',
  'linkedin', 'github', 'portfolio',
  'university', 'major', 'graduationDate', 'gpa',
  'workAuthorization', 'sponsorship',
  'currentCompany', 'currentTitle', 'yearsOfExperience',
  'startDate', 'salaryExpectation', 'coverLetter'
];

// Load profile on popup open
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadHistory();
  loadTheme();
  loadApiKey();
});

// Event listeners
fillFormBtn.addEventListener('click', fillForm);
document.getElementById('previewBtn').addEventListener('click', previewForm);
toggleFormBtn.addEventListener('click', toggleProfileForm);
profileForm.addEventListener('submit', saveProfile);
cancelBtn.addEventListener('click', toggleProfileForm);
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// History actions
exportHistoryBtn.addEventListener('click', exportHistory);
clearHistoryBtn.addEventListener('click', clearHistory);

// AI/Settings actions
generateCoverLetterBtn.addEventListener('click', generateCoverLetter);
toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
saveApiKeyBtn.addEventListener('click', saveApiKey);
testApiKeyBtn.addEventListener('click', testApiKey);

// Load saved profile from storage
async function loadProfile() {
  try {
    const result = await chrome.storage.sync.get('profile');
    const profile = result.profile || {};

    profileFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element && profile[fieldId]) {
        element.value = profile[fieldId];
      }
    });

    // Check if profile exists to show appropriate message
    if (Object.keys(profile).length === 0) {
      toggleFormBtn.textContent = 'Create Profile';
      showMessage('Create your profile to start autofilling forms', 'warning');
    } else {
      toggleFormBtn.textContent = 'Edit Profile';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showMessage('Error loading profile', 'error');
  }
}

// Save profile to storage
async function saveProfile(event) {
  event.preventDefault();

  // Validate all fields first
  const validationErrors = validateProfile();
  if (validationErrors.length > 0) {
    showMessage(`Please fix ${validationErrors.length} validation error${validationErrors.length > 1 ? 's' : ''}`, 'error');
    return;
  }

  const profile = {};
  profileFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element && element.value) {
      profile[fieldId] = element.value;
    }
  });

  try {
    await chrome.storage.sync.set({ profile });
    showMessage('Profile saved successfully', 'success');
    toggleFormBtn.textContent = 'Edit Profile';
    profileForm.classList.add('hidden');
    updateProfileCompleteness();
  } catch (error) {
    console.error('Error saving profile:', error);
    showMessage('Error saving profile', 'error');
  }
}

// Toggle profile form visibility
function toggleProfileForm() {
  profileForm.classList.toggle('hidden');

  if (!profileForm.classList.contains('hidden')) {
    toggleFormBtn.textContent = 'Hide Form';
  } else {
    // Reload to update button text
    loadProfile();
  }
}

// Fill form on active tab
async function fillForm() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showMessage('Unable to access current tab', 'error');
      return;
    }

    // Get profile data
    const result = await chrome.storage.sync.get('profile');
    const profile = result.profile;

    if (!profile || Object.keys(profile).length === 0) {
      showMessage('Please create a profile first', 'warning');
      toggleProfileForm();
      return;
    }

    // Show loading state
    const fillBtn = document.getElementById('fillFormBtn');
    const originalText = fillBtn.innerHTML;
    fillBtn.innerHTML = '<span class="btn-spinner">⏳</span> Filling...';
    fillBtn.disabled = true;

    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['utils/fieldMatchers.js', 'content/content.js']
      });
    } catch (injectError) {
      // Script might already be injected, continue
      console.log('Script injection attempt:', injectError.message);
    }

    // Send message to content script
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'fillForm', profile },
      (response) => {
        // Restore button
        fillBtn.innerHTML = originalText;
        fillBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showMessage('Please reload this page and try again', 'error');
          return;
        }

        if (response && response.success) {
          const count = response.fieldsFilledCount || 0;
          if (count > 0) {
            showMessage(`✓ Successfully filled ${count} field${count !== 1 ? 's' : ''}!`, 'success');

            // Log application to history
            logApplication(tab.url, tab.title, count);
          } else {
            showMessage('No matching fields found on this page', 'warning');
          }
        } else {
          showMessage(response?.message || 'Failed to fill form', 'error');
        }
      }
    );
  } catch (error) {
    console.error('Error filling form:', error);
    showMessage('Error filling form', 'error');
  }
}

// Preview form fields that will be filled
async function previewForm() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showMessage('Unable to access current tab', 'error');
      return;
    }

    // Get profile data
    const result = await chrome.storage.sync.get('profile');
    const profile = result.profile;

    if (!profile || Object.keys(profile).length === 0) {
      showMessage('Please create a profile first', 'warning');
      toggleProfileForm();
      return;
    }

    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['utils/fieldMatchers.js', 'content/content.js']
      });
    } catch (injectError) {
      // Script might already be injected, continue
      console.log('Script injection attempt:', injectError.message);
    }

    // Send preview message to content script
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'previewForm', profile },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showMessage('Please reload this page and try again', 'error');
          return;
        }

        if (response && response.success) {
          const count = response.fieldsDetectedCount || 0;
          if (count > 0) {
            showMessage(`👁 Highlighting ${count} field${count !== 1 ? 's' : ''} that will be filled`, 'success');
          } else {
            showMessage('No matching fields found on this page', 'warning');
          }
        } else {
          showMessage('Unable to preview on this page', 'error');
        }
      }
    );
  } catch (error) {
    console.error('Error previewing form:', error);
    showMessage('Error previewing form: ' + error.message, 'error');
  }
}

// Show message to user
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}

// Tab switching
function switchTab(tabName) {
  // Update tab buttons
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update tab content
  mainView.classList.remove('active');
  historyView.classList.remove('active');
  settingsView.classList.remove('active');

  if (tabName === 'main') {
    mainView.classList.add('active');
  } else if (tabName === 'history') {
    historyView.classList.add('active');
    loadHistory(); // Refresh history when viewing
  } else if (tabName === 'settings') {
    settingsView.classList.add('active');
  }
}

// Log application to history
async function logApplication(url, title, fieldsCount) {
  try {
    const result = await chrome.storage.sync.get('history');
    const history = result.history || [];

    // Check if this URL was already logged recently (within last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentDuplicate = history.find(entry =>
      entry.url === url && entry.timestamp >= fiveMinutesAgo
    );

    if (recentDuplicate) {
      console.log('Skipping duplicate entry for same URL within 5 minutes');
      return;
    }

    // Extract company name from title (simple heuristic)
    const company = extractCompanyName(title);

    // Create history entry
    const entry = {
      id: Date.now(),
      company: company,
      url: url,
      title: title,
      fieldsCount: fieldsCount,
      timestamp: Date.now()
    };

    // Add to beginning of array
    history.unshift(entry);

    // Keep only last 100 entries
    const trimmedHistory = history.slice(0, 100);

    // Save to storage
    await chrome.storage.sync.set({ history: trimmedHistory });

    // Reload history display
    loadHistory();
  } catch (error) {
    console.error('Error logging application:', error);
  }
}

// Extract company name from page title
function extractCompanyName(title) {
  if (!title) return 'Unknown Company';

  // Remove common suffixes
  let company = title
    .replace(/\s*[-|]\s*(Jobs?|Careers?|Applications?|Apply).*$/i, '')
    .replace(/\s*[-|]\s*.*$/i, '')
    .trim();

  // Limit length
  if (company.length > 50) {
    company = company.substring(0, 47) + '...';
  }

  return company || 'Unknown Company';
}

// Load and display history
async function loadHistory() {
  try {
    const result = await chrome.storage.sync.get('history');
    const history = result.history || [];

    // Update stats
    updateStats(history);

    // Render history list
    renderHistory(history);
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Update statistics
function updateStats(history) {
  const total = history.length;
  totalAppsSpan.textContent = total;

  // Calculate applications this week
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thisWeek = history.filter(entry => entry.timestamp >= oneWeekAgo).length;
  weekAppsSpan.textContent = thisWeek;
}

// Render history list
function renderHistory(history) {
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <p>No applications tracked yet.</p>
        <p class="empty-hint">Use "Fill Form" to automatically log your applications.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = history.map(entry => `
    <div class="history-item" data-id="${entry.id}">
      <div class="history-item-header">
        <div class="history-company">${escapeHtml(entry.company)}</div>
        <button class="history-delete" data-id="${entry.id}" title="Delete">×</button>
      </div>
      <div class="history-url">
        <a href="${escapeHtml(entry.url)}" target="_blank" title="${escapeHtml(entry.url)}">
          ${escapeHtml(shortenUrl(entry.url))}
        </a>
      </div>
      <div class="history-meta">
        <span class="history-date">${formatDate(entry.timestamp)}</span>
        <span class="history-fields">${entry.fieldsCount} fields filled</span>
      </div>
    </div>
  `).join('');

  // Add delete listeners
  document.querySelectorAll('.history-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryItem(parseInt(btn.dataset.id));
    });
  });
}

// Delete single history item
async function deleteHistoryItem(id) {
  try {
    const result = await chrome.storage.sync.get('history');
    const history = result.history || [];

    const filtered = history.filter(entry => entry.id !== id);
    await chrome.storage.sync.set({ history: filtered });

    loadHistory();
    showMessage('Application removed from history', 'success');
  } catch (error) {
    console.error('Error deleting history item:', error);
    showMessage('Error deleting item', 'error');
  }
}

// Clear all history
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all application history? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.storage.sync.set({ history: [] });
    loadHistory();
    showMessage('History cleared', 'success');
  } catch (error) {
    console.error('Error clearing history:', error);
    showMessage('Error clearing history', 'error');
  }
}

// Export history as CSV
async function exportHistory() {
  try {
    const result = await chrome.storage.sync.get('history');
    const history = result.history || [];

    if (history.length === 0) {
      showMessage('No history to export', 'warning');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Company', 'URL', 'Fields Filled'];
    const rows = history.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      entry.company,
      entry.url,
      entry.fieldsCount
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fillr-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showMessage('History exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting history:', error);
    showMessage('Error exporting history', 'error');
  }
}

// Utility functions
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function shortenUrl(url) {
  try {
    const urlObj = new URL(url);
    let short = urlObj.hostname + urlObj.pathname;
    if (short.length > 40) {
      short = short.substring(0, 37) + '...';
    }
    return short;
  } catch {
    return url.length > 40 ? url.substring(0, 37) + '...' : url;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== AI FUNCTIONS =====

// Load API key from storage
async function loadApiKey() {
  try {
    const result = await chrome.storage.sync.get('groqApiKey');
    if (result.groqApiKey) {
      apiKeyInput.value = result.groqApiKey;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
  const type = apiKeyInput.type === 'password' ? 'text' : 'password';
  apiKeyInput.type = type;
  toggleApiKeyBtn.textContent = type === 'password' ? '👁' : '🙈';
}

// Save API key to storage
async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showApiKeyStatus('Please enter an API key', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ groqApiKey: apiKey });
    showApiKeyStatus('✓ API key saved successfully', 'success');
  } catch (error) {
    console.error('Error saving API key:', error);
    showApiKeyStatus('Error saving API key', 'error');
  }
}

// Test API key connection
async function testApiKey() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showApiKeyStatus('Please enter an API key first', 'error');
    return;
  }

  testApiKeyBtn.disabled = true;
  testApiKeyBtn.textContent = 'Testing...';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      showApiKeyStatus('✓ API key is valid and working!', 'success');
    } else {
      const error = await response.json();
      showApiKeyStatus(`Error: ${error.error?.message || 'Invalid API key'}`, 'error');
    }
  } catch (error) {
    showApiKeyStatus('Error testing API key: ' + error.message, 'error');
  } finally {
    testApiKeyBtn.disabled = false;
    testApiKeyBtn.textContent = 'Test Connection';
  }
}

// Show API key status message
function showApiKeyStatus(message, type) {
  apiKeyStatusDiv.textContent = message;
  apiKeyStatusDiv.className = `api-key-status ${type}`;
  apiKeyStatusDiv.classList.remove('hidden');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    apiKeyStatusDiv.classList.add('hidden');
  }, 5000);
}

// Generate cover letter using Groq AI
async function generateCoverLetter() {
  try {
    // Check if API key is set
    const result = await chrome.storage.sync.get('groqApiKey');
    const apiKey = result.groqApiKey;

    if (!apiKey) {
      showMessage('Please add your Groq API key in Settings first', 'warning');
      switchTab('settings');
      return;
    }

    // Check if profile exists
    const profileResult = await chrome.storage.sync.get('profile');
    const profile = profileResult.profile;

    if (!profile || Object.keys(profile).length === 0) {
      showMessage('Please create your profile first', 'warning');
      toggleProfileForm();
      return;
    }

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showMessage('Unable to access current tab', 'error');
      return;
    }

    // Show loading state
    generateCoverLetterBtn.disabled = true;
    const originalText = generateCoverLetterBtn.innerHTML;
    generateCoverLetterBtn.innerHTML = '<span class="btn-spinner">⏳</span> Analyzing job posting...';

    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['utils/fieldMatchers.js', 'content/content.js']
      });
    } catch (injectError) {
      console.log('Script injection attempt:', injectError.message);
    }

    // Scrape job description from page
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'scrapeJobDescription' },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showMessage('Please reload this page and try again', 'error');
          generateCoverLetterBtn.disabled = false;
          generateCoverLetterBtn.innerHTML = originalText;
          return;
        }

        if (!response || !response.success) {
          showMessage('Could not extract job description from this page', 'error');
          generateCoverLetterBtn.disabled = false;
          generateCoverLetterBtn.innerHTML = originalText;
          return;
        }

        const { jobDescription, companyName, jobTitle } = response.data;

        // Update loading message
        generateCoverLetterBtn.innerHTML = '<span class="btn-spinner">✨</span> Generating cover letter...';

        // Call Groq API to generate cover letter
        try {
          const coverLetter = await callGroqAPI(apiKey, profile, jobDescription, companyName, jobTitle);

          // Update cover letter field in profile
          const coverLetterField = document.getElementById('coverLetter');
          if (coverLetterField) {
            coverLetterField.value = coverLetter;

            // Show profile form if it's hidden
            if (profileForm.classList.contains('hidden')) {
              profileForm.classList.remove('hidden');
              toggleFormBtn.textContent = 'Hide Form';
            }

            // Scroll to cover letter field
            coverLetterField.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight the field
            coverLetterField.style.border = '2px solid var(--success)';
            setTimeout(() => {
              coverLetterField.style.border = '';
            }, 2000);

            showMessage('✨ Cover letter generated successfully!', 'success');
          } else {
            // If field not found, just show success
            showMessage('✨ Cover letter generated! Check the profile form.', 'success');
          }

        } catch (error) {
          console.error('Error generating cover letter:', error);
          showMessage('Error generating cover letter: ' + error.message, 'error');
        } finally {
          generateCoverLetterBtn.disabled = false;
          generateCoverLetterBtn.innerHTML = originalText;
        }
      }
    );

  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    showMessage('Error: ' + error.message, 'error');
    generateCoverLetterBtn.disabled = false;
  }
}

// Call Groq API to generate cover letter
async function callGroqAPI(apiKey, profile, jobDescription, companyName, jobTitle) {
  const prompt = `You are a professional career coach helping someone write a cover letter for a job application.

APPLICANT PROFILE:
- Name: ${profile.firstName || ''} ${profile.lastName || ''}
- Email: ${profile.email || ''}
- University: ${profile.university || 'Not specified'}
- Major: ${profile.major || 'Not specified'}
- Current/Recent Company: ${profile.currentCompany || 'Not specified'}
- Current/Recent Title: ${profile.currentTitle || 'Not specified'}
- Years of Experience: ${profile.yearsOfExperience || 'Not specified'}
- LinkedIn: ${profile.linkedin || 'Not specified'}
- GitHub: ${profile.github || 'Not specified'}

JOB DETAILS:
- Company: ${companyName}
- Position: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

Write a professional, compelling cover letter for this job application. The cover letter should:
1. Be concise (250-350 words)
2. Highlight relevant skills and experiences from the applicant's profile
3. Show genuine enthusiasm for the role and company
4. Be specific about why they're a good fit
5. Have a professional but warm tone
6. Include a strong opening and closing

DO NOT include:
- The applicant's address or date at the top
- "Dear Hiring Manager" or similar salutation
- A signature block at the end
- Just write the body paragraphs of the cover letter

Write the cover letter now:`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career coach who writes compelling cover letters.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const coverLetter = data.choices[0].message.content.trim();

  return coverLetter;
}

// ===== DARK MODE FUNCTIONS =====

// Load theme from storage
async function loadTheme() {
  try {
    const result = await chrome.storage.sync.get('theme');
    const theme = result.theme || 'light';
    document.body.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  } catch (error) {
    console.error('Error loading theme:', error);
    // Default to light mode
    document.body.setAttribute('data-theme', 'light');
    updateToggleIcon('light');
  }
}

// Toggle between dark and light mode
async function toggleDarkMode() {
  try {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Apply theme with smooth transition
    document.body.setAttribute('data-theme', newTheme);

    // Save to storage
    await chrome.storage.sync.set({ theme: newTheme });

    // Update toggle icon
    updateToggleIcon(newTheme);
  } catch (error) {
    console.error('Error toggling theme:', error);
  }
}

// Update toggle button icon based on current theme
function updateToggleIcon(theme) {
  const icon = document.querySelector('.toggle-icon');
  if (icon) {
    // Show moon for light mode (click to go dark), sun for dark mode (click to go light)
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ===== VALIDATION FUNCTIONS =====

// Validate entire profile
function validateProfile() {
  const errors = [];

  // Email validation
  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value && !validateEmail(emailInput.value)) {
    setFieldError(emailInput, 'Invalid email format');
    errors.push('email');
  } else if (emailInput) {
    clearFieldError(emailInput);
  }

  // Phone validation
  const phoneInput = document.getElementById('phone');
  if (phoneInput && phoneInput.value && !validatePhone(phoneInput.value)) {
    setFieldError(phoneInput, 'Invalid phone format');
    errors.push('phone');
  } else if (phoneInput) {
    clearFieldError(phoneInput);
  }

  // LinkedIn URL validation
  const linkedinInput = document.getElementById('linkedin');
  if (linkedinInput && linkedinInput.value && !validateURL(linkedinInput.value)) {
    setFieldError(linkedinInput, 'Invalid URL format');
    errors.push('linkedin');
  } else if (linkedinInput) {
    clearFieldError(linkedinInput);
  }

  // GitHub URL validation
  const githubInput = document.getElementById('github');
  if (githubInput && githubInput.value && !validateURL(githubInput.value)) {
    setFieldError(githubInput, 'Invalid URL format');
    errors.push('github');
  } else if (githubInput) {
    clearFieldError(githubInput);
  }

  // Portfolio URL validation
  const portfolioInput = document.getElementById('portfolio');
  if (portfolioInput && portfolioInput.value && !validateURL(portfolioInput.value)) {
    setFieldError(portfolioInput, 'Invalid URL format');
    errors.push('portfolio');
  } else if (portfolioInput) {
    clearFieldError(portfolioInput);
  }

  // GPA validation
  const gpaInput = document.getElementById('gpa');
  if (gpaInput && gpaInput.value && !validateGPA(gpaInput.value)) {
    setFieldError(gpaInput, 'GPA must be between 0.0 and 4.0');
    errors.push('gpa');
  } else if (gpaInput) {
    clearFieldError(gpaInput);
  }

  return errors;
}

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Phone validation (flexible format)
function validatePhone(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // Should have 10-11 digits (with or without country code)
  return digits.length >= 10 && digits.length <= 11;
}

// URL validation
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// GPA validation
function validateGPA(gpa) {
  const num = parseFloat(gpa);
  return !isNaN(num) && num >= 0 && num <= 4.0;
}

// Set field error
function setFieldError(element, message) {
  element.classList.add('error');
  element.setAttribute('title', message);

  // Add or update error message
  let errorDiv = element.parentElement.querySelector('.error-message');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    element.parentElement.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

// Clear field error
function clearFieldError(element) {
  element.classList.remove('error');
  element.removeAttribute('title');

  const errorDiv = element.parentElement.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Real-time validation on blur
function setupRealtimeValidation() {
  // Email
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !validateEmail(emailInput.value)) {
        setFieldError(emailInput, 'Invalid email format');
      } else {
        clearFieldError(emailInput);
      }
    });
  }

  // Phone with auto-formatting
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value) {
        // Auto-format phone number
        const formatted = formatPhoneNumber(phoneInput.value);
        if (formatted) {
          phoneInput.value = formatted;
          clearFieldError(phoneInput);
        } else {
          setFieldError(phoneInput, 'Invalid phone format');
        }
      }
    });
  }

  // URLs
  ['linkedin', 'github', 'portfolio'].forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('blur', () => {
        if (input.value && !validateURL(input.value)) {
          setFieldError(input, 'Invalid URL format');
        } else {
          clearFieldError(input);
        }
      });
    }
  });

  // GPA
  const gpaInput = document.getElementById('gpa');
  if (gpaInput) {
    gpaInput.addEventListener('blur', () => {
      if (gpaInput.value && !validateGPA(gpaInput.value)) {
        setFieldError(gpaInput, 'GPA must be between 0.0 and 4.0');
      } else {
        clearFieldError(gpaInput);
      }
    });
  }
}

// Format phone number to (XXX) XXX-XXXX
function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return null;
}

// Update profile completeness indicator
function updateProfileCompleteness() {
  const totalFields = profileFields.length;
  let filledFields = 0;

  profileFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element && element.value && element.value.trim() !== '') {
      filledFields++;
    }
  });

  const percentage = Math.round((filledFields / totalFields) * 100);

  // Update completeness display if it exists
  const completenessDiv = document.getElementById('profileCompleteness');
  if (completenessDiv) {
    completenessDiv.textContent = `${percentage}% complete (${filledFields}/${totalFields} fields)`;
  }
}

// Initialize validation when form is shown
document.addEventListener('DOMContentLoaded', () => {
  setupRealtimeValidation();
  updateProfileCompleteness();
});
