# How to Add OpenAI API Key for Real AI Suggestions

Currently, your app uses **demo data** for AI suggestions. To get real AI-powered travel recommendations, follow these steps:

## Step 1: Get an OpenAI API Key

1. Go to **https://platform.openai.com/**
2. **Sign up** or **log in** to your account
3. Navigate to **"API Keys"** in your account dashboard
4. Click **"Create new secret key"**
5. **Copy the API key** (it starts with `sk-...`)

⚠️ **Important**: Keep this key secure and never share it publicly!

## Step 2: Add the API Key to Your App

1. Open the file: `backend\.env`
2. Find this line:
   ```
   OPENAI_API_KEY=
   ```
3. Replace it with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. **Save the file**

## Step 3: Restart the Backend Server

1. Stop the current backend process
2. Run the startup script again: `.\start-servers.ps1`

## Step 4: Test Real AI Suggestions

1. Open your app: **http://localhost:3000** or **http://192.168.1.95:3000**
2. Create a new itinerary or open an existing one
3. Click the **"AI Suggestions"** button
4. You should now get **real AI-generated travel plans** instead of demo data!

## What You'll Get with Real AI:

✅ **Destination-specific recommendations**
✅ **Personalized daily activities**
✅ **Restaurant suggestions**
✅ **Local attractions and experiences**
✅ **Budget estimates**
✅ **Weather-appropriate packing lists**
✅ **Cultural tips and insights**

## Cost Information

- OpenAI charges per API request
- Typical travel suggestions cost $0.01-0.05 per request
- Check current pricing at: https://openai.com/pricing

## Troubleshooting

**If you get an error:**
1. Make sure the API key is correct (starts with `sk-`)
2. Verify your OpenAI account has credits
3. Check the backend console for error messages
4. Restart both servers after adding the key

**Without an API key:** The app will continue to work with demo suggestions!