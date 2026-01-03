# Installation & Testing Guide

This guide will help you install and test the Fillr extension.

## Quick Start

### Step 1: Generate Icons

Before loading the extension, you need to create the icon files:

1. Open `icons/icon-generator.html` in your browser
2. Right-click each icon (16x16, 48x48, 128x128)
3. Save each as PNG with the correct filename:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
4. Save all three files in the `icons/` directory

**Quick Alternative**: Create simple placeholder PNGs (solid colored squares) with the correct dimensions just to get started.

### Step 2: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `fillr` folder (the root directory containing `manifest.json`)
6. The Fillr extension should now appear in your extensions list

### Step 3: Create Your Profile

1. Click the Fillr extension icon in the Chrome toolbar
2. Click **"Create Profile"** or **"Edit Profile"**
3. Fill out your personal information
4. Click **"Save Profile"**
5. You should see a success message

### Step 4: Test the Extension

#### Option A: Use the Test Form

1. Open `test-form.html` in Chrome (File → Open File)
2. Click the Fillr extension icon
3. Click **"Fill Form"**
4. You should see fields auto-populate with your profile data
5. Fields that were filled will briefly flash with a green border

#### Option B: Test on Real Job Sites

1. Navigate to a job application site (Workday, Greenhouse, Lever, etc.)
2. Click the Fillr extension icon
3. Click **"Fill Form"**
4. Review which fields were auto-filled
5. Complete any remaining fields manually

## Troubleshooting

### Extension Not Loading

- **Error**: "Manifest file is missing or unreadable"
  - **Solution**: Make sure you selected the `fillr` folder (root directory), not a subfolder

- **Error**: "Could not load icon"
  - **Solution**: Generate the icon PNG files as described in Step 1

### Fill Form Not Working

- **Check 1**: Make sure you've saved a profile first
- **Check 2**: Open Chrome DevTools (F12) and check for console errors
- **Check 3**: Verify content script is loaded: Look for "Fillr content script loaded" in console
- **Check 4**: Try refreshing the page after loading the extension

### No Fields Detected

This is normal on some pages. Fillr uses pattern matching to detect fields, so it works best on:
- Standard job application forms
- Forms with common field names (firstName, lastName, email, etc.)
- Forms with proper labels and ARIA attributes

### Debugging

#### Debug the Popup
1. Right-click the Fillr extension icon
2. Select **"Inspect popup"**
3. Check Console tab for errors

#### Debug Content Script
1. Open the web page where you want to test
2. Press **F12** to open DevTools
3. Check Console tab for "Fillr content script loaded"
4. Look for any error messages

#### Debug Background Worker
1. Go to `chrome://extensions/`
2. Find Fillr extension
3. Click **"Service worker"** link
4. Check for errors in the console

## Updating the Extension

After making code changes:

1. Go to `chrome://extensions/`
2. Find Fillr extension
3. Click the **refresh icon** (circular arrow)
4. Test your changes

## Uninstalling

1. Go to `chrome://extensions/`
2. Find Fillr extension
3. Click **"Remove"**
4. Confirm removal

Your profile data will be deleted from Chrome's sync storage.

## Next Steps

- Test on various job application sites
- Report any issues or bugs
- Customize the extension for your needs
- Consider adding new features based on your workflow

## Tips for Best Results

1. **Fill out complete profile**: More data = more fields auto-filled
2. **Use standard formats**: Format phone numbers and dates consistently
3. **Keep profile updated**: Update your GPA, graduation date, etc. as needed
4. **Review before submitting**: Always review auto-filled data before submitting applications
5. **Test first**: Use `test-form.html` to verify everything works before using on real applications

## Need Help?

- Check the main README.md for more information
- Review the code in each file to understand how it works
- Open Chrome DevTools to debug issues
- Review the codebase for implementation details
