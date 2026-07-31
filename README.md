<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/52cce98b-a14e-4aaf-909c-1d2b126aceb7

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
  `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and replace the placeholder values with your own keys.
3. Set at least one AI provider key in `.env.local` (`GROQ_API_KEY` or `GEMINI_API_KEY`) for the AI features.
4. Run the app:
  `npm run dev`
