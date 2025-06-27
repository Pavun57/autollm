# OpenRouter API Setup Guide

## Quick Setup for Development

1. **Get your free OpenRouter API key:**
   - Go to [OpenRouter.ai](https://openrouter.ai)
   - Sign up for a free account
   - Go to "Keys" section and create a new API key

2. **Add the API key to your environment:**
   
   Create or update your `.env.local` file in the project root:
   
   ```bash
   # For development only - exposes key to browser (safe with free keys)
   NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## ⚠️ Security Notice

Using `NEXT_PUBLIC_OPENROUTER_API_KEY` exposes your API key to the browser. This is:
- ✅ **Safe for development** with free OpenRouter models
- ✅ **Safe for free API keys** with no billing attached
- ❌ **NOT safe for production** with paid API keys

## Production Setup (Recommended)

For production, use server-side API calls:

1. **Use server-side environment variable:**
   ```bash
   # Server-side only - secure
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

2. **All API calls will go through `/api/chat` endpoint** (already implemented)

## Free Models Available

The app is configured to use only **FREE** models:
- **Qwen3 30B** - For coding and analysis tasks
- **Qwen3 14B** - For writing and general tasks  
- **DeepSeek R1** - For reasoning tasks

These models require no credits and are completely free to use!

## Troubleshooting

1. **"API key missing" error:**
   - Check your `.env.local` file exists in project root
   - Verify the variable name is exactly `NEXT_PUBLIC_OPENROUTER_API_KEY`
   - Restart your development server

2. **Models not working:**
   - Verify your OpenRouter account is active
   - Check the browser console for detailed error messages

3. **Need help?**
   - Check the [OpenRouter documentation](https://openrouter.ai/docs)
   - Verify your API key works with a simple curl test 