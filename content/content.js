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

      if (!value) return; // Skip if no value in profile

      const inputType = element.type?.toLowerCase();

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
          highlightField(element);
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
            highlightField(radio);
            filledCount++;
          }
        });
      } else if (!element.value) {
        // Regular input or textarea - only fill if empty
        element.value = value;
        triggerChangeEvent(element);
        highlightField(element);
        filledCount++;
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

// Keyboard shortcut: Alt+F to fill form
document.addEventListener('keydown', async (event) => {
  // Check for Alt+F (or Option+F on Mac)
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
      const fillResult = fillFormFields(profile);

      // Show notification
      if (fillResult.success && fillResult.fieldsFilledCount > 0) {
        showNotification(
          `Filled ${fillResult.fieldsFilledCount} field${fillResult.fieldsFilledCount !== 1 ? 's' : ''}`,
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
});

// Show notification on page
function showNotification(message, type = 'success') {
  // Remove existing notification if any
  const existing = document.getElementById('fillr-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'fillr-notification';
  notification.textContent = message;

  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: '999999',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    opacity: '0',
    transform: 'translateY(-10px)'
  });

  // Set color based on type
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
console.log('Fillr content script loaded (Alt+F to fill)');
