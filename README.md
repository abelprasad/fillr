# Fillr - One-Click Job Application Autofill

Fillr is a Chrome browser extension that simplifies job and internship applications by providing one-click autofill functionality for common form fields.

## Features

- **Profile Management**: Store your personal information once and reuse it across all applications
- **Smart Field Detection**: Intelligently matches form fields using multiple detection strategies
- **One-Click Autofill**: Fill out entire application forms with a single click
- **Application Tracker**: Automatically log every application with company name, date, and URL
- **Export History**: Download your application history as CSV for tracking
- **Visual Feedback**: See which fields were filled with highlighted animations
- **Privacy First**: All data stored locally using Chrome's sync storage

## Installation

### Install from Source (Development)

1. Clone or download this repository
2. Generate extension icons (see `icons/README.md`)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the `fillr` directory

### Install from Chrome Web Store

Coming soon!

## Usage

### First-Time Setup

1. Click the Fillr extension icon in your Chrome toolbar
2. Click "Create Profile" or "Edit Profile"
3. Fill out your information in the profile form
4. Click "Save Profile"

### Using Fillr on Job Applications

1. Navigate to any job application page (Workday, Greenhouse, Lever, etc.)
2. Click the Fillr extension icon
3. Click "Fill Form"
4. Review the auto-filled fields
5. Complete any remaining custom questions
6. Submit your application

### Tracking Your Applications

1. Click the Fillr extension icon
2. Switch to the "History" tab
3. View all your submitted applications with:
   - Company name (extracted from page title)
   - Application URL
   - Date and time applied
   - Number of fields filled
4. Export your history as CSV for spreadsheet tracking
5. Delete individual entries or clear all history

## Profile Data Fields

Fillr stores the following information:

### Personal Information
- First Name
- Last Name
- Email
- Phone Number
- Address (Street, City, State, ZIP)

### Professional Links
- LinkedIn URL
- GitHub URL
- Portfolio Website

### Education
- University Name
- Major
- Expected Graduation Date
- GPA

### Work Authorization
- Work Authorization Status
- Sponsorship Requirement

## Technical Architecture

### File Structure

```
fillr/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html         # Profile form UI
│   ├── popup.js           # Save/load profile logic
│   └── popup.css          # Styling
├── content/
│   └── content.js         # Field detection and filling
├── background/
│   └── background.js      # Service worker
├── utils/
│   └── fieldMatchers.js   # Field pattern matching
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Technology Stack

- **Manifest Version**: V3 (latest Chrome extension standard)
- **JavaScript**: Vanilla JS (no frameworks)
- **Storage**: Chrome Storage Sync API
- **Styling**: Plain CSS

### How It Works

1. **Field Detection**: Content script scans the page for form inputs
2. **Pattern Matching**: Matches fields using name, id, label, placeholder, and aria-label attributes
3. **Data Retrieval**: Fetches stored profile from Chrome storage
4. **Autofill**: Populates matching fields with profile data
5. **Visual Feedback**: Highlights filled fields with green border animation

## Supported Platforms

Fillr works on major Applicant Tracking Systems (ATS):

- Workday
- Greenhouse
- Lever
- Taleo
- Generic HTML forms
- And many more!

## Privacy & Security

- All data is stored locally using Chrome's sync storage
- No data is sent to external servers
- No tracking or analytics
- Open source - review the code yourself

## Development

### Prerequisites

- Google Chrome browser
- Basic knowledge of Chrome extensions

### Testing

1. Load the extension in developer mode
2. Navigate to a test job application page
3. Create a test profile
4. Click "Fill Form" and verify fields are populated correctly

### Debugging

- Open Chrome DevTools on the popup: Right-click extension icon → Inspect popup
- View console logs in content script: Open DevTools on the page (F12)
- Check background service worker: chrome://extensions → Fillr → Service worker

## Roadmap

### v1.0
- ✅ Profile management
- ✅ Smart field detection
- ✅ One-click autofill
- ✅ Visual feedback

### v1.1 (Current)
- ✅ Application history tracking
- ✅ Statistics dashboard (total apps, weekly apps)
- ✅ Export history to CSV
- ✅ Delete individual entries

### Future Versions
- AI-powered field matching
- Multiple profile support
- Resume tailoring suggestions
- Advanced analytics and insights
- Cover letter templates
- Browser notifications for application milestones

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

Having issues? Please open an issue on GitHub with:
- Chrome version
- Extension version
- Steps to reproduce the problem
- Screenshots if applicable

## Acknowledgments

Built to solve a real problem faced by students and professionals applying to multiple positions. Inspired by the tedious process of filling out repetitive job application forms.

---

Made with ❤️ for job seekers everywhere
