# Load Insights - Gmail Scanner Chrome Extension

Automatically extract rate confirmation PDFs from Gmail and send them to your Load Insights dashboard.

## Features

- 🔍 **Smart Search** - Finds rate confirmations in Gmail automatically
- 📄 **PDF Detection** - Identifies and extracts PDF attachments
- 🚀 **One-Click Processing** - Sends PDFs directly to your Load Insights API
- 📊 **Live Progress** - Real-time status updates during scanning
- 🔔 **Notifications** - Desktop alerts when processing completes
- 🔐 **Secure** - Uses OAuth 2.0 for Gmail authentication

## Prerequisites

1. **Google Cloud Project** with Gmail API enabled
2. **Load Insights App** running (locally or deployed)
3. **Chrome Browser** (or any Chromium-based browser)

---

## Setup Instructions

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a New Project:**
   - Click "Select a project" → "New Project"
   - Name: "Load Insights Gmail Scanner"
   - Click "Create"

3. **Enable Gmail API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in:
     - App name: `Load Insights Gmail Scanner`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - **Add Scopes:**
     - Click "Add or Remove Scopes"
     - Search and add: `https://www.googleapis.com/auth/gmail.readonly`
     - Click "Save and Continue"
   - **Add Test Users** (if External):
     - Add your Gmail address
     - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Chrome Extension**
   - Name: `Load Insights Extension`
   - Click "Create"
   - **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

6. **Update manifest.json:**
   - Open `manifest.json` in this folder
   - Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your Client ID
   - Save the file

### Step 2: Install the Extension

1. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in the top-right corner

3. **Load Extension:**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - Extension should appear with the Load Insights icon

### Step 3: Configure API Endpoint

1. **Click the extension icon** in Chrome toolbar

2. **Set API URL:**
   - For local development: `http://localhost:3000/api/extract`
   - For production: `https://your-domain.com/api/extract`

3. **Click "Scan Gmail for Rate Confirmations"**

4. **Grant Permissions:**
   - Google will ask for Gmail access
   - Click "Continue" → "Allow"

---

## Usage

### Manual Scan

1. Click the extension icon
2. Click "Scan Gmail for Rate Confirmations"
3. Watch the progress in real-time
4. PDFs automatically sent to your dashboard
5. Desktop notification when complete

### Search Patterns

The extension searches for emails with:
- Subject contains: "rate confirmation"
- Subject contains: "load confirmation"  
- Subject contains: "carrier confirmation"
- Has PDF attachments

### Stats Display

- **Found** - Number of emails with rate confirmations
- **Processed** - Successfully extracted and sent to API
- **Failed** - Errors during processing

---

## Troubleshooting

### "Failed to authenticate with Gmail"
- Check OAuth Client ID in `manifest.json`
- Make sure Gmail API is enabled in Google Cloud
- Try removing and re-granting permissions

### "API error: Failed to fetch"
- Check API URL is correct
- Make sure your Load Insights app is running
- For localhost: Check the port number (default: 3000)
- Check browser console for CORS errors

### No emails found
- Verify you have rate confirmation emails in Gmail
- Check they have PDF attachments
- Try searching Gmail manually with: `has:attachment filename:pdf subject:"rate confirmation"`

### PDFs not processing
- Check the Load Insights app logs
- Verify OpenAI API key is configured
- Make sure Google Maps API key is set (for miles calculation)

---

## Advanced Configuration

### Auto-Scan (Optional)

To enable automatic scanning every 30 minutes:

1. Open `background.js`
2. Uncomment the alarm code at the bottom
3. Reload the extension

### Custom Search Queries

To modify what emails are scanned:

1. Open `popup.js`
2. Find the `searchGmail` function
3. Edit the `queries` array
4. Example: `'has:attachment filename:pdf from:broker@example.com'`

### Production Deployment

1. Update `manifest.json`:
   - Change `host_permissions` to your production domain
   - Update version number

2. Update API URL in extension popup

3. For Chrome Web Store:
   - Package extension: `Extensions` → `Pack extension`
   - Submit to [Chrome Web Store](https://chrome.google.com/webstore/devconsole)

---

## Security Notes

- Extension only requests `gmail.readonly` permission (read-only access)
- No emails or PDFs are stored by the extension
- All data sent directly to your Load Insights API
- OAuth tokens handled securely by Chrome Identity API

---

## Permissions Explained

- **identity** - For Gmail OAuth authentication
- **storage** - Save API URL preference
- **notifications** - Show scan completion alerts
- **gmail.readonly** - Read emails to find rate confirmations

---

## Support

For issues or questions:
1. Check the browser console for errors (F12 → Console)
2. Check your Load Insights app logs
3. Verify all API keys are configured correctly

---

## Version History

**v1.0.0** - Initial release
- Gmail OAuth integration
- PDF detection and extraction
- Real-time progress tracking
- Desktop notifications

---

## Next Steps

After setup is complete:
1. Test with a few rate confirmation emails
2. Check your Load Insights dashboard for new loads
3. Verify miles are calculated correctly
4. Set up auto-scan if desired

**Enjoy automatic rate confirmation processing!** 🎉

