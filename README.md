# Load Insights MVP

A sleek, modern Next.js web app with a dark theme that uses AI to extract structured data from rate confirmation PDFs and display beautiful analytics. **Now with Gmail OAuth integration** - sign in with Google and manually sync to import rate confirmations from your Gmail!

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` in the root directory:
```bash
# Required for AI extraction
OPENAI_API_KEY=sk-your-api-key-here

# Required for mileage calculation
GOOGLE_MAPS_API_KEY=your-google-maps-key-here

# Required for Gmail OAuth integration
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**API Keys Setup:**
- **OpenAI API key**: https://platform.openai.com/api-keys
- **Google Maps API key**: https://console.cloud.google.com/
  - Enable "Directions API" in your Google Cloud project
  - See `DISTANCE_API_SETUP.md` for detailed setup instructions
- **Google OAuth**: See [Gmail OAuth Setup](#gmail-oauth-setup) below
- **NEXTAUTH_SECRET**: Run `openssl rand -base64 32` to generate

### 3. Run the App
```bash
npm run dev
```
Open http://localhost:3000

## ✨ Features

- 🔐 **Gmail OAuth Integration** - Sign in with Google to access rate confirmations from the last 30 days!
- 👥 **Multi-user support** - Each user's data is stored separately
- 📧 **Manual Gmail sync** - Click the sync button to import new rate confirmations when ready
- 🎨 **Modern dark UI** - Sleek glassmorphism design with gradient accents
- 📄 **Manual PDF upload** - Still available for one-off uploads or offline use
- 🤖 **AI extraction** - GPT-4 automatically extracts all data
- 📏 **Google Maps integration** - Auto-calculates exact driving miles from pickup to delivery
- 📊 **Dashboard** - Beautiful metrics cards, charts, and detailed load table
- 🔍 **Click loads** - View full details in a full-screen dedicated page
- 💾 **Per-user storage** - Data persists securely in separate files per user
- 🗑️ **Clear data** - One-click to clear all loads with confirmation
- 📱 **Works everywhere** - Access from any device with a browser (laptop, phone, tablet)

## What Gets Extracted

- Load ID, broker info (name, email, phone)
- Carrier details (name, MC number, email, phone, address)
- Rate breakdown (total, linehaul, accessorials)
- Equipment type and temperature requirements
- All pickup/delivery stops with dates and times
- Commodity, weight
- **Miles** - Auto-calculated using Google Maps from pickup to delivery addresses
- **RPM** - Auto-calculated (Rate ÷ Miles)

## Project Structure

```
MVP1/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   ├── load/[id]/page.tsx    # Individual load details page
│   └── api/
│       ├── extract/route.ts  # PDF processing endpoint
│       ├── loads/route.ts    # Data retrieval endpoint
│       └── clear/route.ts    # Clear all loads endpoint
├── components/
│   ├── UploadBox.tsx         # File upload UI with real-time progress
│   ├── LoadTable.tsx         # Data table (click rows for details)
│   ├── Metrics.tsx           # Dashboard metrics
│   └── Charts.tsx            # Revenue & RPM charts
├── lib/
│   ├── schema.ts             # TypeScript types
│   ├── extract.ts            # OpenAI extraction logic
│   └── storage.ts            # JSON file storage with duplicate detection
├── data/
│   └── loads.json            # Stored data (auto-created)
└── chrome-extension/         # 🆕 Gmail Scanner Extension
    ├── manifest.json         # Extension configuration
    ├── popup.html            # Extension UI
    ├── popup.js              # Gmail scanning logic
    ├── background.js         # Background service worker
    ├── icon-generator.html   # Tool to create icons
    └── README.md             # Extension setup guide
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **OpenAI GPT-4** - AI extraction
- **pdf-parse** - PDF text extraction
- **Recharts** - Charts

## Usage

1. **Upload PDFs** - Drag and drop rate confirmation PDFs
2. **View Dashboard** - See metrics and charts update automatically
3. **Click Loads** - Click any row in the table to see full details
4. **Data Persists** - All loads saved to `data/loads.json`

## Cost

- ~$0.01-0.05 per PDF with GPT-4
- 100 PDFs/month ≈ $3-5

## Customization

### Change Extraction Fields
Edit `lib/schema.ts` to add/remove fields from the extraction schema.

### Switch AI Model
In `lib/extract.ts`, change:
```typescript
model: "gpt-4-turbo-preview"  // or use "gpt-3.5-turbo" for cheaper
```

### Modify UI
- Components in `components/`
- Colors in `tailwind.config.ts`
- Global styles in `app/globals.css`

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Add `OPENAI_API_KEY` in Vercel dashboard environment variables.

### Other Options
Works on Netlify, Railway, Render, or any Node.js host.

## Troubleshooting

**"OpenAI API key not configured"**
- Check `.env.local` exists and has your key
- Restart dev server after adding the key

**"No text found in PDF"**
- Ensure PDF has selectable text (not a scanned image)

**Port already in use**
```bash
npm run dev -- -p 3001
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run linter
```

## 📧 Gmail OAuth Setup

To enable automatic Gmail import, you need to set up Google OAuth:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Name it "Load Insights" or whatever you prefer

### Step 2: Enable Gmail API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required fields:
   - App name: "Load Insights"
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. On **Scopes** page, click **Add or Remove Scopes**:
   - Add `https://www.googleapis.com/auth/gmail.readonly`
6. Click **Save and Continue**
7. On **Test users** page, add your Gmail address (and any other users who will use the app)
8. Click **Save and Continue**

### Step 4: Create OAuth Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Name it "Load Insights Web"
5. Add **Authorized redirect URIs**:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 5: Add to Environment Variables

Add these to your `.env.local` file:
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 6: Restart Server

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### Step 7: Test It Out!

1. Go to http://localhost:3000
2. Click **"Sign in with Google"**
3. Authorize the app to read your Gmail
4. Click **"Sync from Gmail"**
5. Watch your rate confirmations automatically import! 🎉

## Environment Variables

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key for AI extraction
- `GOOGLE_MAPS_API_KEY` - Google Maps API key for calculating miles from addresses
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID for Gmail integration
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js sessions
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

See `DISTANCE_API_SETUP.md` for step-by-step Google Maps API setup.

## 🔌 Optional: Chrome Extension

A Chrome extension is also available in the `chrome-extension/` folder for an alternative way to scan Gmail. However, **the built-in Gmail OAuth integration is now the recommended method** as it works on any device and doesn't require installing an extension.

## License

MIT

---

**Ready?** Run `npm install`, add your API keys to `.env.local`, and `npm run dev`! 🚀

📖 See `GOOGLE_MAPS_SETUP.md` for Google Maps API setup guide.
