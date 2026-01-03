# Fillr - One-Click Job Application Autofill

Fillr is a Chrome browser extension that simplifies job and internship applications by providing one-click autofill functionality for common form fields.

## Features

- **AI-Powered Cover Letters**: Generate personalized cover letters using Google Gemini AI
- **Profile Management**: Store your personal information once and reuse it across all applications
- **Smart Field Detection**: Intelligently matches form fields using multiple detection strategies
- **One-Click Autofill**: Fill out entire application forms with a single click
- **Application Tracker**: Automatically log every application with company name, date, and URL
- **Export History**: Download your application history as CSV for tracking
- **Visual Feedback**: See which fields were filled with highlighted animations
- **Dark Mode**: Beautiful dark theme with automatic theme persistence
- **Privacy First**: All data stored locally using Chrome's sync storage

## AI Features

### Smart Cover Letter Generation

Fillr now includes AI-powered cover letter generation using Google Gemini, completely free!

**How it works:**
1. Navigate to any job posting (Workday, Greenhouse, LinkedIn, etc.)
2. Click the "Generate Cover Letter with AI" button
3. AI analyzes the job description and your profile
4. Creates a personalized, professional cover letter (250-350 words)
5. Auto-fills the cover letter field in your profile

**Supported Platforms:**
- Greenhouse
- Lever
- Workday
- LinkedIn Jobs
- Indeed
- Generic job boards

**Setup (One-Time):**
1. Get a free API key from [Google AI Studio](https://ai.google.dev/)
2. Open Fillr → Settings tab
3. Paste your API key and click "Save"
4. Click "Test Connection" to verify

**Free Tier:** Gemini 2.0 Flash (experimental) - check current limits at ai.google.dev

**Privacy:** Your API key is stored locally in your browser only. Job descriptions are sent to Google Gemini API for processing but are not stored.

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

### Using AI Cover Letter Generation

1. Navigate to a job posting page
2. Click the Fillr extension icon
3. Click "Generate Cover Letter with AI" ✨
4. Wait 5-10 seconds while AI analyzes the job
5. Review the generated cover letter in the profile form
6. Edit if needed and save
7. Click "Fill Form" to autofill your application

**Tip:** The AI considers your entire profile (education, experience, skills) and the job description to create a tailored cover letter for each position.

## Profile Data Fields

Fillr stores the following information:

### Personal Information
- First Name
- Middle Name
- Last Name
- Email
- Phone Number
- Address (Street, Apt/Suite, City, State, ZIP, Country)

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

### Work Experience
- Current/Most Recent Company
- Current/Most Recent Title
- Years of Experience

### Job Application Details
- Earliest Start Date
- Salary Expectation
- Cover Letter / Why This Company

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
- **AI**: Google Gemini 1.5 Flash API
- **Styling**: Modern CSS with CSS variables for theming

### How It Works

**Autofill:**
1. **Field Detection**: Content script scans the page for form inputs
2. **Pattern Matching**: Matches fields using name, id, label, placeholder, and aria-label attributes
3. **Data Retrieval**: Fetches stored profile from Chrome storage
4. **Autofill**: Populates matching fields with profile data
5. **Visual Feedback**: Highlights filled fields with green border animation

**AI Cover Letters:**
1. **Job Scraping**: Extracts job description, company name, and title from page
2. **Profile Analysis**: Gathers relevant info from your saved profile
3. **AI Generation**: Sends context to Google Gemini API
4. **Personalization**: AI crafts cover letter matching job requirements
5. **Auto-fill**: Generated content populates the cover letter field

## Supported Platforms

Fillr works on major Applicant Tracking Systems (ATS):

- Workday
- Greenhouse
- Lever
- Taleo
- Generic HTML forms
- And many more!

## Privacy & Security

- All profile data is stored locally using Chrome's sync storage
- API keys are stored locally in your browser only
- Job descriptions are sent to Google Gemini API only during cover letter generation
- No tracking or analytics
- No data collection by Fillr
- Open source - review the code yourself

**Note:** When using AI features, job descriptions are sent to Google's Gemini API for processing. This is required for cover letter generation. Your API key and profile data remain in your browser.

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

### v1.1
- ✅ Application history tracking
- ✅ Statistics dashboard (total apps, weekly apps)
- ✅ Export history to CSV
- ✅ Delete individual entries

### v1.2
- ✅ Dark mode with theme persistence
- ✅ Enhanced visual design with glassmorphism
- ✅ Preview mode for form fields
- ✅ Keyboard shortcuts (Alt+F, Alt+P)

### v1.3 (Current)
- ✅ AI-powered cover letter generation with Google Gemini
- ✅ Smart job description scraper
- ✅ Settings tab for API key management
- ✅ Personalized cover letters based on profile + job posting

### Future Versions
- AI-powered custom question answering
- Multiple profile support
- Resume tailoring suggestions with AI
- Advanced analytics and insights
- Browser notifications for application milestones
- Chrome Web Store publication

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
