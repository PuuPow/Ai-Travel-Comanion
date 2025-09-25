# Adding Real AI Suggestions

The Travel Planner currently uses demo data for AI suggestions. To enable real AI-powered itinerary and packing list generation, you need to add an OpenAI API key.

## Steps to Enable Real AI Suggestions:

1. **Get an OpenAI API Key:**
   - Go to [https://platform.openai.com/](https://platform.openai.com/)
   - Sign up or log in to your account
   - Navigate to "API Keys" in your account settings
   - Create a new API key

2. **Add the API Key to your environment:**
   - Open `backend\.env` file
   - Replace this line:
     ```
     OPENAI_API_KEY=
     ```
   - With:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

3. **Restart the backend server:**
   - Stop the current backend process
   - Run the startup script again: `.\start-servers.ps1`

4. **Test the AI suggestions:**
   - Go to any itinerary in the app
   - Click the "AI Suggestions" button
   - You should now get real AI-generated travel plans!

## Current Features with Mock Data:
✅ Full app functionality
✅ Create and manage itineraries
✅ Demo AI suggestions (generic but realistic)
✅ Mobile access
✅ Database storage

## Features with Real OpenAI API Key:
🚀 Real AI-generated itineraries tailored to your destination
🚀 Smart packing lists based on weather, activities, and duration
🚀 Personalized travel recommendations
🚀 Destination-specific tips and insights

**Note:** Using the OpenAI API may incur costs. Check OpenAI's pricing for current rates.