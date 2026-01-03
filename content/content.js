// Content script for detecting and filling form fields
// This runs on all web pages to enable autofill functionality

// Constants
const JOB_DESC_MAX_LENGTH = 8000;
const PREVIEW_AUTO_CLEAR_MS = 30000; // 30 seconds

// Theme cache to avoid multiple storage fetches
let themeCache = null;
let themeCacheTime = 0;
const THEME_CACHE_DURATION_MS = 60000; // Cache for 1 minute

// Track last focused/right-clicked element for context menu
let lastFocusedElement = null;
document.addEventListener('contextmenu', (e) => {
  if (e.target.matches('input, textarea')) {
    lastFocusedElement = e.target;
  }
}, true);

/**
 * Get theme preference with caching
 */
async function getTheme() {
  const now = Date.now();
  // Return cached value if still valid
  if (themeCache !== null && (now - themeCacheTime) < THEME_CACHE_DURATION_MS) {
    return themeCache;
  }

  // Fetch from storage
  try {
    const result = await chrome.storage.sync.get('theme');
    themeCache = result.theme === 'dark';
    themeCacheTime = now;
    return themeCache;
  } catch (error) {
    console.log('Could not get theme preference');
    return false; // Default to light theme
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle async operations properly
  if (request.action === 'fillForm') {
    fillFormFields(request.profile).then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'previewForm') {
    previewFormFields(request.profile).then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'scrapeJobDescription') {
    const result = scrapeJobDescription();
    sendResponse(result);
    return true; // Keep message channel open for async response
  } else if (request.action === 'fillrUp') {
    // AI answer generation for right-clicked field
    fillrUpAnswer().then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }
});

/**
 * Fill form fields with profile data
 */
async function fillFormFields(profile) {
  try {
    if (!profile || Object.keys(profile).length === 0) {
      return {
        success: false,
        message: 'No profile data available',
        fieldsFilledCount: 0
      };
    }

    // Detect all form fields on the page
    const detectedFields = window.FieldMatchers.detectFormFields();

    if (detectedFields.length === 0) {
      return {
        success: true,
        message: 'No matching fields found',
        fieldsFilledCount: 0
      };
    }

    // Get theme preference from cache
    const isDark = await getTheme();

    let filledCount = 0;

    // Fill each detected field with corresponding profile data
    for (const { element, fieldType } of detectedFields) {
      const value = profile[fieldType];

      if (!value) continue; // Skip if no value in profile

      const inputType = element.type?.toLowerCase();

      // Handle different input types
      if (element.tagName === 'SELECT') {
        // Try to match select option by value or text
        const matchedOption = findMatchingOption(element, value);
        if (matchedOption) {
          element.value = matchedOption.value;
          triggerChangeEvent(element);
          highlightFieldSync(element, isDark);
          filledCount++;
        }
      } else if (inputType === 'checkbox') {
        // Check checkbox if value is truthy or matches certain strings
        const shouldCheck = value === true ||
                           value === 'true' ||
                           value === 'yes' ||
                           value === '1' ||
                           value === 'on';
        if (shouldCheck && !element.checked) {
          element.checked = true;
          triggerChangeEvent(element);
          highlightFieldSync(element, isDark);
          filledCount++;
        }
      } else if (inputType === 'radio') {
        // Select radio button if value matches
        const radioGroup = document.querySelectorAll(
          `input[type="radio"][name="${element.name}"]`
        );
        radioGroup.forEach(radio => {
          if (radio.value.toLowerCase() === value.toLowerCase() && !radio.checked) {
            radio.checked = true;
            triggerChangeEvent(radio);
            highlightFieldSync(radio, isDark);
            filledCount++;
          }
        });
      } else if (!element.value) {
        // Regular input or textarea - only fill if empty
        element.value = value;
        triggerChangeEvent(element);
        highlightFieldSync(element, isDark);
        filledCount++;
      }
    }

    return {
      success: true,
      message: `Filled ${filledCount} fields`,
      fieldsFilledCount: filledCount
    };

  } catch (error) {
    console.error('Error filling form:', error);
    return {
      success: false,
      message: 'Error filling form: ' + error.message,
      fieldsFilledCount: 0
    };
  }
}

/**
 * Find matching option in a select element
 * Tries to match by value first, then by text content
 * Prioritizes exact matches over partial matches
 */
function findMatchingOption(selectElement, targetValue) {
  const options = Array.from(selectElement.options);
  const targetLower = targetValue.toLowerCase();

  // Priority 1: Exact value match (case-sensitive)
  let match = options.find(opt => opt.value === targetValue);
  if (match) return match;

  // Priority 2: Exact value match (case-insensitive)
  match = options.find(opt => opt.value.toLowerCase() === targetLower);
  if (match) return match;

  // Priority 3: Exact text content match (case-insensitive)
  match = options.find(opt => opt.textContent.trim().toLowerCase() === targetLower);
  if (match) return match;

  // Priority 4: Value starts with target (more specific than contains)
  match = options.find(opt => opt.value.toLowerCase().startsWith(targetLower));
  if (match) return match;

  // Priority 5: Text starts with target
  match = options.find(opt => opt.textContent.trim().toLowerCase().startsWith(targetLower));
  if (match) return match;

  // Priority 6: Partial match in value (only if no better match found)
  match = options.find(opt => opt.value.toLowerCase().includes(targetLower));
  if (match) return match;

  // Priority 7: Partial match in text (last resort)
  match = options.find(opt => opt.textContent.toLowerCase().includes(targetLower));

  return match;
}

/**
 * Trigger change events on an element
 * This ensures the page's JavaScript handlers recognize the change
 */
function triggerChangeEvent(element) {
  // Trigger input event
  const inputEvent = new Event('input', { bubbles: true, cancelable: true });
  element.dispatchEvent(inputEvent);

  // Trigger change event
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  element.dispatchEvent(changeEvent);

  // Trigger blur event (some forms validate on blur)
  const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
  element.dispatchEvent(blurEvent);
}

/**
 * Highlight a filled field with green border animation (synchronous version)
 */
function highlightFieldSync(element, isDark = false) {
  const originalBorder = element.style.border;
  const originalOutline = element.style.outline;
  const originalTransition = element.style.transition;
  const originalBackground = element.style.backgroundColor;

  // Apply highlight with animation (with theme support)
  element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  element.style.border = '3px solid #10b981';
  element.style.outline = 'none';
  element.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5';
  element.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';

  // Remove highlight after animation
  setTimeout(() => {
    element.style.transition = originalTransition;
    element.style.border = originalBorder;
    element.style.outline = originalOutline;
    element.style.backgroundColor = originalBackground;
    element.style.boxShadow = '';
  }, 1500);
}

/**
 * Preview form fields that will be filled (without actually filling)
 */
async function previewFormFields(profile) {
  try {
    if (!profile || Object.keys(profile).length === 0) {
      return {
        success: false,
        message: 'No profile data available',
        fieldsDetectedCount: 0
      };
    }

    // Clear any existing previews
    clearPreviewHighlights();

    // Detect all form fields on the page
    const detectedFields = window.FieldMatchers.detectFormFields();

    if (detectedFields.length === 0) {
      return {
        success: true,
        message: 'No matching fields found',
        fieldsDetectedCount: 0
      };
    }

    let detectedCount = 0;

    // Get theme preference from cache
    const isDark = await getTheme();

    // Highlight each detected field
    for (const { element, fieldType } of detectedFields) {
      const value = profile[fieldType];
      if (value) {
        await highlightPreviewFieldSync(element, fieldType, value, isDark);
        detectedCount++;
      }
    }

    // Add clear preview button
    await showClearPreviewButton();

    return {
      success: true,
      message: `Detected ${detectedCount} fields`,
      fieldsDetectedCount: detectedCount
    };

  } catch (error) {
    console.error('Error previewing form:', error);
    return {
      success: false,
      message: 'Error previewing form: ' + error.message,
      fieldsDetectedCount: 0
    };
  }
}

/**
 * Highlight a field in preview mode (synchronous version)
 */
function highlightPreviewFieldSync(element, fieldType, value, isDark = false) {
  // Add preview class
  element.classList.add('fillr-preview-highlight');

  // Store original styles
  const originalBorder = element.style.border;
  const originalBackground = element.style.backgroundColor;
  const originalBoxShadow = element.style.boxShadow;

  // Apply preview highlight (with theme support)
  element.style.border = '3px solid #8b5cf6';
  element.style.backgroundColor = isDark ? 'rgba(139, 92, 246, 0.15)' : '#faf5ff';
  element.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
  element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

  // Add tooltip showing what will be filled
  const tooltip = document.createElement('div');
  tooltip.className = 'fillr-preview-tooltip';
  tooltip.textContent = `${fieldType}: ${truncateValue(value)}`;
  tooltip.style.cssText = `
    position: absolute;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    z-index: 999999;
    pointer-events: none;
    box-shadow: ${isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(139, 92, 246, 0.3)'};
    backdrop-filter: blur(10px);
  `;

  document.body.appendChild(tooltip);

  // Position tooltip with boundary detection
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Default: position above the element
  let top = window.scrollY + rect.top - tooltipRect.height - 5;
  let left = window.scrollX + rect.left;

  // If tooltip would go above viewport, position below instead
  if (rect.top - tooltipRect.height < 0) {
    top = window.scrollY + rect.bottom + 5;
  }

  // If tooltip would go off right edge, align to right
  if (rect.left + tooltipRect.width > viewportWidth) {
    left = window.scrollX + rect.right - tooltipRect.width;
  }

  // If tooltip would go off left edge, align to left
  if (left < window.scrollX) {
    left = window.scrollX + 5;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  // Store original styles for cleanup
  element.dataset.fillrOriginalBorder = originalBorder;
  element.dataset.fillrOriginalBackground = originalBackground;
  element.dataset.fillrOriginalBoxShadow = originalBoxShadow;
}

/**
 * Clear all preview highlights
 */
function clearPreviewHighlights() {
  // Remove all highlighted elements
  document.querySelectorAll('.fillr-preview-highlight').forEach(element => {
    element.classList.remove('fillr-preview-highlight');
    element.style.border = element.dataset.fillrOriginalBorder || '';
    element.style.backgroundColor = element.dataset.fillrOriginalBackground || '';
    element.style.boxShadow = element.dataset.fillrOriginalBoxShadow || '';

    delete element.dataset.fillrOriginalBorder;
    delete element.dataset.fillrOriginalBackground;
    delete element.dataset.fillrOriginalBoxShadow;
  });

  // Remove all tooltips
  document.querySelectorAll('.fillr-preview-tooltip').forEach(tooltip => {
    tooltip.remove();
  });

  // Remove clear button
  const clearBtn = document.getElementById('fillr-clear-preview');
  if (clearBtn) {
    clearBtn.remove();
  }
}

/**
 * Show button to clear preview
 */
async function showClearPreviewButton() {
  // Get theme preference from cache
  const isDark = await getTheme();

  // Remove existing button if any
  const existing = document.getElementById('fillr-clear-preview');
  if (existing) {
    existing.remove();
  }

  const button = document.createElement('button');
  button.id = 'fillr-clear-preview';
  button.textContent = '✕ Clear Preview';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 999999;
    box-shadow: ${isDark ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(139, 92, 246, 0.4)'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = isDark ? '0 12px 28px rgba(0, 0, 0, 0.6)' : '0 6px 16px rgba(139, 92, 246, 0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(139, 92, 246, 0.4)';
  });

  button.addEventListener('click', () => {
    clearPreviewHighlights();
    showNotification('Preview cleared', 'success');
  });

  document.body.appendChild(button);

  // Auto-remove after timeout
  setTimeout(() => {
    clearPreviewHighlights();
  }, PREVIEW_AUTO_CLEAR_MS);
}

/**
 * Truncate value for tooltip display
 */
function truncateValue(value) {
  const str = String(value);
  return str.length > 30 ? str.substring(0, 27) + '...' : str;
}

// Keyboard shortcuts: Alt+F to fill, Alt+P to preview
document.addEventListener('keydown', async (event) => {
  // Check for Alt+F (or Option+F on Mac) - Fill Form
  if (event.altKey && event.key.toLowerCase() === 'f') {
    event.preventDefault();

    try {
      // Get profile from storage
      const result = await chrome.storage.sync.get('profile');
      const profile = result.profile;

      if (!profile || Object.keys(profile).length === 0) {
        showNotification('Please create a profile first', 'warning');
        return;
      }

      // Fill the form
      const fillResult = await fillFormFields(profile);

      // Show notification
      if (fillResult.success && fillResult.fieldsFilledCount > 0) {
        showNotification(
          `✓ Filled ${fillResult.fieldsFilledCount} field${fillResult.fieldsFilledCount !== 1 ? 's' : ''}!`,
          'success'
        );
      } else if (fillResult.fieldsFilledCount === 0) {
        showNotification('No matching fields found on this page', 'warning');
      } else {
        showNotification('Failed to fill form', 'error');
      }
    } catch (error) {
      console.error('Error with keyboard shortcut:', error);
      showNotification('Error filling form', 'error');
    }
  }

  // Check for Alt+P (or Option+P on Mac) - Preview Fields
  if (event.altKey && event.key.toLowerCase() === 'p') {
    event.preventDefault();

    try {
      // Get profile from storage
      const result = await chrome.storage.sync.get('profile');
      const profile = result.profile;

      if (!profile || Object.keys(profile).length === 0) {
        showNotification('Please create a profile first', 'warning');
        return;
      }

      // Preview the form
      const previewResult = await previewFormFields(profile);

      // Show notification
      if (previewResult.success && previewResult.fieldsDetectedCount > 0) {
        showNotification(
          `👁 Highlighting ${previewResult.fieldsDetectedCount} field${previewResult.fieldsDetectedCount !== 1 ? 's' : ''}`,
          'success'
        );
      } else if (previewResult.fieldsDetectedCount === 0) {
        showNotification('No matching fields found on this page', 'warning');
      } else {
        showNotification('Failed to preview form', 'error');
      }
    } catch (error) {
      console.error('Error with preview shortcut:', error);
      showNotification('Error previewing form', 'error');
    }
  }

  // Check for Escape key - Clear Preview
  if (event.key === 'Escape') {
    const clearBtn = document.getElementById('fillr-clear-preview');
    if (clearBtn) {
      clearPreviewHighlights();
      showNotification('Preview cleared', 'success');
    }
  }
});

// Show notification on page
async function showNotification(message, type = 'success') {
  // Remove existing notification if any
  const existing = document.getElementById('fillr-notification');
  if (existing) {
    existing.remove();
  }

  // Get theme preference from cache
  const isDark = await getTheme();

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'fillr-notification';
  notification.textContent = message;

  // Base styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: '999999',
    boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: '0',
    transform: 'translateY(-10px)',
    backdropFilter: 'blur(10px)'
  });

  // Set color based on type and theme
  if (type === 'success') {
    notification.style.backgroundColor = '#10b981';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#ef4444';
    notification.style.color = 'white';
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#f59e0b';
    notification.style.color = 'white';
  }

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Log that content script is loaded
console.log('✓ Fillr extension loaded | Alt+F to fill | Alt+P to preview | Right-click → Fillr Up');

/**
 * AI-powered answer generation for custom questions
 * Triggered by right-click context menu "Fillr Up"
 */
async function fillrUpAnswer() {
  try {
    // Check if we have a target element
    if (!lastFocusedElement) {
      showNotification('Please right-click on a text field to use Fillr Up', 'warning');
      return { success: false, message: 'No target element' };
    }

    const targetElement = lastFocusedElement;

    // Extract question text from the field's context
    const questionText = extractQuestionText(targetElement);
    if (!questionText) {
      showNotification('Could not detect question text for this field', 'warning');
      return { success: false, message: 'No question detected' };
    }

    // Get user profile and API key
    const result = await chrome.storage.sync.get(['profile', 'groqApiKey']);
    const profile = result.profile;
    const apiKey = result.groqApiKey;

    if (!apiKey) {
      showNotification('Please set up your Groq API key in Settings first', 'warning');
      return { success: false, message: 'No API key' };
    }

    if (!profile || Object.keys(profile).length === 0) {
      showNotification('Please create your profile first', 'warning');
      return { success: false, message: 'No profile' };
    }

    // Show loading state
    const originalValue = targetElement.value;
    const originalPlaceholder = targetElement.placeholder;
    targetElement.placeholder = '✨ Generating answer with AI...';
    targetElement.disabled = true;

    // Get job context from page
    const jobContext = scrapeJobDescription();
    const companyName = jobContext.success ? jobContext.data.companyName : 'the company';
    const jobTitle = jobContext.success ? jobContext.data.jobTitle : 'this position';

    // Generate AI answer
    try {
      const answer = await generateQuestionAnswer(
        apiKey,
        profile,
        questionText,
        companyName,
        jobTitle
      );

      // Fill the field with the answer
      targetElement.value = answer;
      targetElement.disabled = false;
      targetElement.placeholder = originalPlaceholder;

      // Trigger change events
      triggerChangeEvent(targetElement);

      // Highlight the field
      const isDark = await getTheme();
      highlightFieldSync(targetElement, isDark);

      showNotification('✨ Answer generated successfully!', 'success');

      return { success: true, message: 'Answer generated' };

    } catch (error) {
      console.error('Error generating answer:', error);
      targetElement.value = originalValue;
      targetElement.disabled = false;
      targetElement.placeholder = originalPlaceholder;
      showNotification('Error generating answer: ' + error.message, 'error');
      return { success: false, message: error.message };
    }

  } catch (error) {
    console.error('Error in fillrUpAnswer:', error);
    showNotification('Error: ' + error.message, 'error');
    return { success: false, message: error.message };
  }
}

/**
 * Extract question text from field's surrounding context
 */
function extractQuestionText(element) {
  let questionText = '';

  // Priority 1: Label (by 'for' attribute)
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label && label.textContent.trim()) {
      questionText = label.textContent.trim();
    }
  }

  // Priority 2: Parent label
  if (!questionText) {
    const parentLabel = element.closest('label');
    if (parentLabel) {
      questionText = parentLabel.textContent.trim();
    }
  }

  // Priority 3: aria-label
  if (!questionText && element.getAttribute('aria-label')) {
    questionText = element.getAttribute('aria-label').trim();
  }

  // Priority 4: Placeholder
  if (!questionText && element.placeholder) {
    questionText = element.placeholder.trim();
  }

  // Priority 5: Name attribute (clean up underscores/dashes)
  if (!questionText && element.name) {
    questionText = element.name
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  }

  // Priority 6: Previous sibling text
  if (!questionText) {
    let sibling = element.previousElementSibling;
    while (sibling && !questionText) {
      const text = sibling.textContent.trim();
      if (text && text.length < 200) {
        questionText = text;
        break;
      }
      sibling = sibling.previousElementSibling;
    }
  }

  return questionText;
}

/**
 * Call Groq API to generate answer for a custom question
 */
async function generateQuestionAnswer(apiKey, profile, questionText, companyName, jobTitle) {
  const prompt = `You are helping a job applicant answer an application question.

APPLICANT PROFILE:
- Name: ${profile.firstName || ''} ${profile.lastName || ''}
- Email: ${profile.email || ''}
- University: ${profile.university || 'Not specified'}
- Major: ${profile.major || 'Not specified'}
- GPA: ${profile.gpa || 'Not specified'}
- Current/Recent Company: ${profile.currentCompany || 'Not specified'}
- Current/Recent Title: ${profile.currentTitle || 'Not specified'}
- Years of Experience: ${profile.yearsOfExperience || 'Not specified'}
- LinkedIn: ${profile.linkedin || 'Not specified'}
- GitHub: ${profile.github || 'Not specified'}
- Work Authorization: ${profile.workAuthorization || 'Not specified'}

JOB DETAILS:
- Company: ${companyName}
- Position: ${jobTitle}

QUESTION TO ANSWER:
"${questionText}"

Write a professional, compelling answer to this question. The answer should:
1. Be concise (2-4 sentences, 50-150 words)
2. Highlight relevant skills and experiences from the applicant's profile
3. Show genuine enthusiasm for the role and company
4. Be specific and personalized (not generic)
5. Use first person ("I", "my")

Write ONLY the answer, no preamble or explanation:`;

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
          content: 'You are a professional career coach helping with job applications. Write concise, personalized answers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const answer = data.choices[0].message.content.trim();

  return answer;
}

/**
 * Scrape job description from the current page
 */
function scrapeJobDescription() {
  try {
    let jobDescription = '';
    let companyName = '';
    let jobTitle = '';
    
    // Strategy 1: Try common job board selectors
    const commonSelectors = [
      // Greenhouse
      '#content .app-wrapper, #app-body',
      // Lever
      '.posting-headline, .posting-description, .section-wrapper',
      // Workday
      '[data-automation-id="jobPostingDescription"]',
      // LinkedIn
      '.show-more-less-html__markup',
      // Indeed
      '#jobDescriptionText',
      // Generic
      '[class*="job-description"], [class*="description"], [id*="description"]',
      'main article, main section',
      '[role="main"]'
    ];

    for (const selector of commonSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 100) {
        jobDescription = element.textContent.trim();
        break;
      }
    }

    // Strategy 2: If no specific selector found, get main content
    if (!jobDescription) {
      const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
      jobDescription = main.textContent.trim();
    }

    // Extract company name from various sources
    const companySelectors = [
      '[class*="company-name"]',
      '[class*="employer"]',
      '[data-automation-id="company"]',
      '.topcard__org-name',
      'meta[property="og:site_name"]',
      'meta[name="author"]'
    ];

    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        companyName = element.textContent || element.getAttribute('content') || '';
        companyName = companyName.trim();
        if (companyName) break;
      }
    }

    // Extract job title
    const titleSelectors = [
      'h1',
      '[class*="job-title"]',
      '[class*="posting-headline"]',
      '[data-automation-id="jobPostingHeader"]',
      '.topcard__title',
      'meta[property="og:title"]'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        jobTitle = element.textContent || element.getAttribute('content') || '';
        jobTitle = jobTitle.trim();
        if (jobTitle) break;
      }
    }

    // Clean up description (remove extra whitespace)
    jobDescription = jobDescription
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Limit description length to avoid API limits
    // Try to truncate at sentence boundary for better context
    if (jobDescription.length > JOB_DESC_MAX_LENGTH) {
      let truncated = jobDescription.substring(0, JOB_DESC_MAX_LENGTH);
      // Find last sentence ending (., !, or ?)
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? ')
      );
      if (lastSentenceEnd > JOB_DESC_MAX_LENGTH * 0.8) {
        // Only use sentence boundary if it's not too far back (at least 80% of max)
        truncated = truncated.substring(0, lastSentenceEnd + 1);
      }
      jobDescription = truncated + '...';
    }

    return {
      success: true,
      data: {
        jobDescription,
        companyName: companyName || 'the company',
        jobTitle: jobTitle || 'this position',
        pageUrl: window.location.href,
        pageTitle: document.title
      }
    };

  } catch (error) {
    console.error('Error scraping job description:', error);
    return {
      success: false,
      message: 'Error scraping job description: ' + error.message
    };
  }
}
