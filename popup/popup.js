// DOM elements
const fillFormBtn = document.getElementById('fillFormBtn');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const profileForm = document.getElementById('profileForm');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// Profile field IDs
const profileFields = [
  'firstName', 'lastName', 'email', 'phone',
  'street', 'city', 'state', 'zip',
  'linkedin', 'github', 'portfolio',
  'university', 'major', 'graduationDate', 'gpa',
  'workAuthorization', 'sponsorship'
];

// Load profile on popup open
document.addEventListener('DOMContentLoaded', loadProfile);

// Event listeners
fillFormBtn.addEventListener('click', fillForm);
toggleFormBtn.addEventListener('click', toggleProfileForm);
profileForm.addEventListener('submit', saveProfile);
cancelBtn.addEventListener('click', toggleProfileForm);

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

    // Send message to content script
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'fillForm', profile },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showMessage('Unable to fill form on this page', 'error');
          return;
        }

        if (response && response.success) {
          const count = response.fieldsFilledCount || 0;
          if (count > 0) {
            showMessage(`Successfully filled ${count} field${count !== 1 ? 's' : ''}`, 'success');
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
