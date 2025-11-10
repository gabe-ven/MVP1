# Google Maps API Setup

This guide will help you enable automatic mile calculation from pickup/delivery addresses using Google Maps.

## Step 1: Get Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms if it's your first time

## Step 2: Create a Project

1. Click the project dropdown at the top
2. Click "New Project"
3. Name it (e.g., "Load Insights")
4. Click "Create"

## Step 3: Enable Directions API

1. Go to [Directions API](https://console.cloud.google.com/marketplace/product/google/directions-backend.googleapis.com)
2. Make sure your project is selected
3. Click **"Enable"** button
4. Wait a few seconds for it to activate

## Step 4: Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key that appears
4. (Optional) Click "Restrict Key" to limit usage:
   - Under "API restrictions", select "Restrict key"
   - Check only "Directions API"
   - Click "Save"

## Step 5: Enable Billing (Required)

⚠️ **Important:** Google Maps API requires billing to be enabled

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click "Link a billing account" or "Create billing account"
3. Add your credit card information

**Cost:** Very cheap for this app
- First $200/month is FREE (Google Cloud credit)
- After that: $0.005 per request (half a cent)
- Example: 1000 loads/month = $5 after free credit

## Step 6: Add to Your Project

Add the key to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_MAPS_API_KEY=AIzaSyB... # Paste your key here
```

## Step 7: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

## How to Test It

1. Upload any PDF with pickup and delivery addresses
2. Check the server console logs - you should see:
   ```
   ✓ Google Maps: 1234 miles from [pickup address] to [delivery address]
   ```
3. The load will have miles and RPM automatically calculated!

## Troubleshooting

### "API key not valid"
- Make sure you copied the full key
- Check that Directions API is enabled
- Restart your dev server after adding the key

### "This API method requires billing to be enabled"
- You must add a credit card to Google Cloud
- Don't worry - first $200/month is free!

### Miles still not showing
- Check server console for error messages
- Verify pickup and delivery addresses are being extracted from PDF
- Make sure addresses are complete (city, state required)

### "REQUEST_DENIED" status
- Billing is not enabled
- API key is restricted and Directions API is not allowed
- API key is invalid

## API Limits

- **Free tier:** $200 credit/month (covers ~40,000 requests)
- For this app: You'll likely never exceed free tier unless processing thousands of loads

## Security (Optional but Recommended)

To prevent unauthorized use of your API key:

1. Go to [API Key restrictions](https://console.cloud.google.com/apis/credentials)
2. Click your API key
3. Under "Application restrictions":
   - For local dev: Leave unrestricted
   - For production: Add your domain (e.g., `yourdomain.com`)
4. Under "API restrictions":
   - Select "Restrict key"
   - Check only "Directions API"

---

**That's it!** Now your app will automatically calculate miles from addresses for every load! 🎯

