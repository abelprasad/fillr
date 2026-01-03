# Changelog

All notable changes to Fillr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-03

### Added
- **AI-Powered Custom Question Answering**: Right-click context menu "Fillr Up ✨" for instant AI-generated answers to application questions
- Context menu integration for seamless AI question answering workflow
- Smart question text extraction from labels, placeholders, and surrounding context (6-tier detection)
- Debug logging for easier troubleshooting of AI features
- Escape key support to clear preview mode
- AI test form (`ai-test-form.html`) with 10 realistic job application questions
- Lightning Fill icon design (electric blue with lightning bolt)
- Python icon generator script with customizable design

### Fixed
- **CRITICAL**: Fixed async/await in keyboard shortcuts (Alt+F and Alt+P now work correctly)
- **CRITICAL**: Added button timeout safeguards (10s for fill, 30s for AI) to prevent stuck UI buttons
- **CRITICAL**: Implemented chrome.storage.sync quota handling with automatic fallback to local storage
- **SECURITY**: Prevented CSV injection attacks in history export
- **SECURITY**: Added API key format validation (checks for `gsk_` prefix and minimum length)
- Fixed variable name conflict in `logApplication` function
- Fixed async message handling in content script for proper Promise resolution
- Enhanced select dropdown matching with 7-tier priority system (exact → starts-with → contains)
- Fixed tooltip positioning to prevent off-screen rendering with boundary detection
- International phone number support (7-15 digits per ITU E.164 standard)
- Smart job description truncation at sentence boundaries instead of mid-word
- Fixed phone number formatting to handle international formats

### Changed
- Theme caching implementation reduces storage API calls by 75%
- Extracted all magic numbers to named constants for better maintainability
- Improved field matching accuracy with prioritized matching strategy
- Better error messages and user feedback throughout the extension
- Enhanced API error handling with specific error types

### Improved
- Added confirmation dialog before overwriting existing cover letters
- Performance optimizations in field detection algorithm
- Reduced unnecessary storage fetches with intelligent caching
- Better visual feedback with theme-aware animations
- Improved notification system with auto-dismissal

## [1.3.0] - 2025-01-02

### Added
- AI-powered cover letter generation using Groq API (Llama 3.3 70B)
- Smart job description scraper supporting multiple ATS platforms
- Settings tab for API key management
- Test Connection feature for API key validation
- Personalized cover letters based on profile and job description

### Changed
- Migrated from Google Gemini to Groq API for better performance
- Updated to Llama 3.3 70B model for higher quality generation

## [1.2.0] - 2024-12-30

### Added
- Dark mode with persistent theme selection
- Preview mode to highlight fields before filling (Alt+P)
- Keyboard shortcuts:
  - Alt+F: Quick fill without opening popup
  - Alt+P: Preview mode
- Enhanced visual design with glassmorphism effects
- Profile completeness indicator
- Real-time field validation with inline error messages

### Improved
- UI polish with better spacing and typography
- Theme toggle with smooth transitions
- Visual feedback for all user actions

## [1.1.0] - 2024-12-28

### Added
- Application history tracking with automatic logging
- Statistics dashboard showing total and weekly application counts
- CSV export functionality for application history
- Delete individual history entries
- Clear all history option with confirmation
- Deduplication logic (5-minute window for same URL)
- History limit of 100 entries with automatic cleanup

### Improved
- Company name extraction from page titles
- Relative timestamps (e.g., "5m ago", "2h ago")
- URL shortening for better display

## [1.0.0] - 2024-12-25

### Added
- Profile management with 25+ fields
- Smart field detection using multiple attributes
- One-click autofill for job applications
- Visual feedback with green border animations
- Chrome Storage Sync for cross-device synchronization
- Support for 40+ field types including:
  - Personal information (name, email, phone, address)
  - Professional links (LinkedIn, GitHub, portfolio)
  - Education (university, major, GPA, graduation date)
  - Work experience (company, title, years of experience)
  - Job application fields (start date, salary, work authorization)

### Supported Platforms
- Workday
- Greenhouse
- Lever
- Taleo
- Generic HTML forms

## [0.1.0] - 2024-12-20

### Added
- Initial project setup
- Basic extension structure with Manifest V3
- Field pattern matching utility
- Simple test form for development

---

## Upgrade Guide

### Upgrading to 1.4.0

1. Reload the extension at `chrome://extensions/`
2. Your existing profile and settings will be preserved
3. New features (Fillr Up context menu) will be immediately available
4. No API key changes required (Groq API key continues to work)

### Upgrading to 1.3.0

1. Get a free Groq API key from [console.groq.com](https://console.groq.com)
2. Open Fillr → Settings tab
3. Enter your API key and click "Save"
4. Test the connection to verify setup

### Breaking Changes

**v1.3.0:**
- Google Gemini API is no longer supported
- Existing Gemini API keys will need to be replaced with Groq API keys
- Cover letter generation may produce different output due to model change

---

## Future Releases

### Planned for 1.5.0
- Multiple profile support
- Resume upload automation
- Advanced analytics dashboard
- Browser notifications

### Under Consideration
- Firefox and Edge support
- Mobile browser compatibility
- Team/organizational features
- Integration with job boards

---

For detailed information about each release, see the [README.md](README.md) file.
