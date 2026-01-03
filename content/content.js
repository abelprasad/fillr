// Content script for detecting and filling form fields
// This runs on all web pages to enable autofill functionality

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    const result = fillFormFields(request.profile);
    sendResponse(result);
  }
  return true; // Keep message channel open for async response
});

/**
 * Fill form fields with profile data
 */
function fillFormFields(profile) {
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

    let filledCount = 0;

    // Fill each detected field with corresponding profile data
    detectedFields.forEach(({ element, fieldType }) => {
      const value = profile[fieldType];

      if (value && !element.value) { // Only fill if empty
        // Handle different input types
        if (element.tagName === 'SELECT') {
          // Try to match select option by value or text
          const matchedOption = findMatchingOption(element, value);
          if (matchedOption) {
            element.value = matchedOption.value;
            triggerChangeEvent(element);
            highlightField(element);
            filledCount++;
          }
        } else {
          // Regular input or textarea
          element.value = value;
          triggerChangeEvent(element);
          highlightField(element);
          filledCount++;
        }
      }
    });

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
 */
function findMatchingOption(selectElement, targetValue) {
  const options = Array.from(selectElement.options);

  // Try exact value match
  let match = options.find(opt => opt.value === targetValue);
  if (match) return match;

  // Try case-insensitive value match
  match = options.find(opt =>
    opt.value.toLowerCase() === targetValue.toLowerCase()
  );
  if (match) return match;

  // Try text content match
  match = options.find(opt =>
    opt.textContent.trim().toLowerCase() === targetValue.toLowerCase()
  );
  if (match) return match;

  // Try partial match
  match = options.find(opt =>
    opt.value.toLowerCase().includes(targetValue.toLowerCase()) ||
    opt.textContent.toLowerCase().includes(targetValue.toLowerCase())
  );

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
 * Highlight a filled field with green border animation
 */
function highlightField(element) {
  const originalBorder = element.style.border;
  const originalOutline = element.style.outline;
  const originalTransition = element.style.transition;

  // Apply highlight
  element.style.transition = 'all 0.3s ease';
  element.style.border = '2px solid #10b981';
  element.style.outline = 'none';

  // Remove highlight after animation
  setTimeout(() => {
    element.style.transition = originalTransition;
    element.style.border = originalBorder;
    element.style.outline = originalOutline;
  }, 1000);
}

// Log that content script is loaded
console.log('Fillr content script loaded');
