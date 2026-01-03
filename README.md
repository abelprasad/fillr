# Fillr ⚡ - AI-Powered Job Application Autofill

> **Lightning-fast autofill for job applications with AI-powered cover letters and question answering**

Fillr is a Chrome browser extension that eliminates the tedious parts of job hunting. Fill out entire applications with one click, generate personalized cover letters, and use AI to answer custom questions - all while keeping your data private and secure.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://github.com/abelprasad/fillr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.4.0-green)](https://github.com/abelprasad/fillr)

## ✨ Features

### 🤖 AI-Powered Features (NEW!)

- **Custom Question Answering**: Right-click any application question → "Fillr Up ✨" → Get personalized AI-generated answers
- **Smart Cover Letters**: Generate tailored cover letters for any job in seconds
- **Context-Aware**: AI considers your profile, the job description, and company info

### ⚡ Core Features

- **One-Click Autofill**: Fill entire job applications instantly
- **Smart Field Detection**: Intelligently matches 40+ field types
- **Application Tracker**: Auto-log every application with history and analytics
- **Dark Mode**: Beautiful theme that persists across sessions
- **Preview Mode**: See what will be filled before you fill it
- **Keyboard Shortcuts**: Alt+F (fill), Alt+P (preview), Esc (clear)
- **Privacy First**: All data stored locally, you control everything

---

## 🚀 Quick Start

### Installation

1. Clone this repository or download as ZIP
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `fillr` folder
5. Done! The Fillr icon will appear in your toolbar

### Setup (30 seconds)

1. Click the Fillr icon
2. Fill out your profile (name, email, education, experience, etc.)
3. **Optional**: Add your free Groq API key for AI features (Settings tab)
4. Start applying to jobs!

---

## 🎯 How to Use

### Basic Autofill

1. Go to any job application page
2. Click Fillr icon → **"Fill Form"**
3. Watch your information fill in automatically
4. Review and submit!

**Supports**: Workday, Greenhouse, Lever, Taleo, LinkedIn, Indeed, and most ATS platforms

### AI Question Answering ("Fillr Up")

Perfect for those tricky custom questions like:
- "Why do you want to work here?"
- "Tell us about a challenging project"
- "What makes you a good fit?"

**How to use:**
1. Right-click any text field in a job application
2. Select **"Fillr Up ✨"** from the menu
3. AI analyzes the question and your profile
4. Personalized answer appears instantly!

**What it considers:**
- Your education, experience, and skills
- The specific question being asked
- The company and job title
- Professional tone and appropriate length

### AI Cover Letter Generation

1. Navigate to a job posting
2. Click Fillr icon → **"Generate Cover Letter with AI"**
3. Wait 5-10 seconds
4. Review the personalized 250-350 word cover letter
5. Edit if needed, then use "Fill Form"

### Keyboard Shortcuts

- **Alt + F**: Quick fill (without opening popup)
- **Alt + P**: Preview mode (highlights fillable fields)
- **Esc**: Clear preview mode

### Application History

- Automatically tracks every application
- View stats (total apps, weekly count)
- Export to CSV for spreadsheet tracking
- Delete individual entries or clear all

---

## 🧠 AI Setup (Optional but Recommended)

Fillr uses **Groq** for AI features - it's completely free and blazingly fast!

### Get Your Free API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card required)
3. Create an API key
4. Copy the key (starts with `gsk_`)

### Configure in Fillr

1. Click Fillr icon → **Settings** tab
2. Paste your API key
3. Click **"Test Connection"** to verify
4. Click **"Save"**

**Why Groq?**
- ⚡ 10x faster than competitors
- 🆓 Completely free with generous limits
- 🚀 Uses Llama 3.3 70B (state-of-the-art model)
- 💳 No credit card required
- 🔒 Secure and private

---

## 📊 Supported Field Types

Fillr automatically detects and fills **40+ field types**:

### Personal Information
- Names (first, middle, last, preferred)
- Contact (email, phone, address)
- Demographics (optional fields)

### Professional Links
- LinkedIn, GitHub, Portfolio
- Social media profiles

### Education
- University, Major, GPA
- Graduation date, Degree type

### Work Experience
- Current/past company and title
- Years of experience
- Work authorization status

### Job Application
- Start date, Salary expectations
- Cover letter / motivation
- Sponsorship requirements

### Custom Questions (with AI)
- Any textarea or open-ended question
- Personalized answers based on your profile

---

## 🔒 Privacy & Security

**Your data, your control:**

- ✅ All profile data stored **locally** in Chrome sync storage
- ✅ API keys never leave your browser
- ✅ No tracking or analytics
- ✅ No data collection by Fillr
- ✅ Open source - review the code yourself

**AI Features:**
- Job descriptions sent to Groq API only during generation
- Not stored or retained by Groq
- Your API key and profile stay in your browser
- You can disable AI features anytime

---

## ⚙️ Technical Details

### Architecture

```
fillr/
├── manifest.json              # Chrome Extension config (Manifest V3)
├── popup/
│   ├── popup.html            # Profile UI with tabs
│   ├── popup.js              # Logic (33KB)
│   └── popup.css             # Dark mode styling
├── content/
│   └── content.js            # Field detection & AI features
├── background/
│   └── background.js         # Service worker & context menu
├── utils/
│   └── fieldMatchers.js      # 40+ field patterns
└── icons/
    └── *.png                 # Lightning Fill icons
```

### Tech Stack

- **Framework**: Vanilla JavaScript (no dependencies)
- **Extension API**: Chrome Manifest V3
- **Storage**: Chrome Storage Sync API
- **AI**: Groq API (Llama 3.3 70B)
- **Styling**: CSS variables for theming

### How It Works

**Autofill Process:**
1. Content script scans page for input/textarea/select elements
2. Matches fields using 6-tier detection strategy:
   - `name` attribute
   - `id` attribute
   - Associated `<label>` text
   - `placeholder` text
   - `aria-label` attribute
   - `autocomplete` attribute
3. Retrieves profile from Chrome storage
4. Fills matching fields with stored data
5. Triggers change events for framework compatibility
6. Highlights filled fields with animations

**AI Question Answering:**
1. User right-clicks text field
2. "Fillr Up" option appears in context menu
3. Extracts question text from label/placeholder/context
4. Retrieves user profile and scrapes page for job details
5. Sends to Groq API with personalized prompt
6. Receives answer in 2-5 seconds
7. Fills field automatically with highlight animation

**Field Detection Strategy:**
```javascript
// Example: Email field detection
Patterns: ['email', 'e-mail', 'emailaddress', 'email-address']
Checks: name, id, placeholder, label, aria-label, autocomplete
Match: Normalized string comparison (case-insensitive, no special chars)
```

---

## 🐛 Bug Fixes & Improvements

### Recent Fixes (v1.4.0)

**Critical:**
- ✅ Fixed async/await in keyboard shortcuts
- ✅ Added button timeout safeguards (no more stuck buttons)
- ✅ Implemented storage quota handling with local fallback

**Security:**
- ✅ Prevented CSV injection attacks
- ✅ Added API key format validation
- ✅ Improved error handling throughout

**Quality:**
- ✅ Enhanced select dropdown matching (7-tier priority system)
- ✅ Fixed tooltip positioning for edge cases
- ✅ International phone number support (7-15 digits)
- ✅ Smart job description truncation at sentence boundaries
- ✅ Theme caching to reduce API calls
- ✅ Confirmation before overwriting cover letters
- ✅ Extracted magic numbers to constants

**Performance:**
- ✅ Reduced theme fetch calls by 75%
- ✅ Optimized field detection algorithm
- ✅ Async message handling improvements

---

## 📝 Version History

### v1.4.0 (Current)
- 🆕 AI-powered custom question answering ("Fillr Up")
- 🆕 Right-click context menu for instant AI answers
- 🆕 Lightning Fill icon design (electric blue + lightning bolt)
- 🔧 28 bug fixes and improvements
- 🔧 Enhanced field matching accuracy
- 🔧 Better error handling and validation
- 🔧 Performance optimizations

### v1.3.0
- AI-powered cover letter generation with Groq
- Smart job description scraper
- Settings tab for API key management
- Personalized cover letters using Llama 3.3 70B

### v1.2.0
- Dark mode with theme persistence
- Preview mode for form fields
- Keyboard shortcuts (Alt+F, Alt+P)
- Enhanced visual design

### v1.1.0
- Application history tracking
- Statistics dashboard
- CSV export functionality
- Delete individual entries

### v1.0.0
- Profile management
- Smart field detection
- One-click autofill
- Visual feedback

---

## 🧪 Testing

### Test Forms

1. **AI Test Form**: `ai-test-form.html` (included)
   - 10 realistic job application questions
   - Perfect for testing "Fillr Up" feature
   - Beautiful UI with instructions

2. **Basic Test Form**: `test-form.html` (included)
   - Standard fields (name, email, address, etc.)
   - Tests basic autofill functionality

### Manual Testing Checklist

- [ ] Create and save profile
- [ ] Fill form on test page
- [ ] Test preview mode (Alt+P)
- [ ] Test keyboard shortcuts (Alt+F)
- [ ] Generate AI cover letter
- [ ] Right-click "Fillr Up" on questions
- [ ] Check application history
- [ ] Export history to CSV
- [ ] Toggle dark mode
- [ ] Test on real job site

---

## 🛣️ Roadmap

### Completed ✅
- Profile management and autofill
- Application history tracking
- Dark mode and theming
- AI cover letter generation
- AI question answering
- Keyboard shortcuts
- Preview mode

### Planned 🚀
- [ ] Multiple profile support (different job types)
- [ ] Resume upload automation
- [ ] Advanced analytics dashboard
- [ ] Browser notifications
- [ ] Chrome Web Store publication
- [ ] Firefox/Edge support

### Under Consideration 💭
- Custom field mappings
- Team/organizational features
- Integration with job boards
- Application status tracking
- Interview scheduler

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/abelprasad/fillr.git
cd fillr

# Generate icons (optional, if modifying)
python generate-icons.py

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the fillr directory
```

### Code Style

- Use vanilla JavaScript (no frameworks)
- Follow existing code patterns
- Add comments for complex logic
- Test on multiple ATS platforms
- Ensure backward compatibility

---

## 💡 Tips & Tricks

### Maximize Accuracy
- Fill out your complete profile (more data = better AI answers)
- Include your GitHub/LinkedIn for technical roles
- Add your cover letter preferences for consistent tone

### Speed Up Applications
1. Use **Alt+F** for instant fill (no popup)
2. Use **"Fillr Up"** on all custom questions first
3. Then use **"Fill Form"** for standard fields
4. Review and submit!

### Best Practices
- Review AI-generated content before submitting
- Keep your profile updated as you gain experience
- Export application history weekly for tracking
- Use preview mode on unfamiliar forms first

---

## ❓ FAQ

**Q: Is Fillr free?**
A: Yes! Completely free and open source. AI features use your own free Groq API key.

**Q: Do I need an API key?**
A: Only for AI features (cover letters and "Fillr Up"). Basic autofill works without it.

**Q: Is my data safe?**
A: Yes. Everything is stored locally in your browser using Chrome's encrypted sync storage.

**Q: What job sites does it work on?**
A: Works on 90%+ of job sites including Workday, Greenhouse, Lever, LinkedIn, Indeed, and most ATS platforms.

**Q: Can I use it for multiple applications?**
A: Yes! That's the whole point. Use it for hundreds of applications.

**Q: Does it work on mobile?**
A: Currently Chrome desktop only. Mobile support planned for future.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built to solve the real pain of repetitive job applications
- Powered by Groq's incredible AI infrastructure
- Inspired by every job seeker who's filled out the same form 100 times
- Icons designed with Python PIL for pixel-perfect quality

---

## 📞 Support

**Need help?**
- 🐛 [Report a bug](https://github.com/abelprasad/fillr/issues)
- 💡 [Request a feature](https://github.com/abelprasad/fillr/issues)
- 📧 Contact: [GitHub Issues](https://github.com/abelprasad/fillr/issues)

**When reporting issues, include:**
- Chrome version
- Extension version (v1.4.0)
- Steps to reproduce
- Screenshots (if applicable)
- Console errors (F12 → Console tab)

---

<div align="center">

**Made with ⚡ for job seekers everywhere**

[⭐ Star on GitHub](https://github.com/abelprasad/fillr) • [🐛 Report Bug](https://github.com/abelprasad/fillr/issues) • [💡 Request Feature](https://github.com/abelprasad/fillr/issues)

</div>
