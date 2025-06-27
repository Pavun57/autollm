# Changelog

## [Latest] - 2024-01-XX

### Added
- **V0-Style Chat Interface Integration**
  - **Modern Landing Interface**: Beautiful v0-inspired chat landing page
  - **Auto-Resize Textarea**: Smart input field that grows with content
  - **Action Buttons**: Quick-start prompts for common tasks (screenshots, Figma, landing pages)
  - **Lazy Chat Creation**: Conversations only created when user sends first message
  - **Initial Message Handling**: Seamless transition from landing to chat with user's prompt
- **AI Memory System for Personalized Responses**
  - **Automatic Memory Detection**: Captures personal information from chat (name, job, preferences)
  - **Memory Management**: Full memory CRUD operations via settings interface
  - **Chat Commands**: Clear memory with "forget all memory" or similar phrases
  - **Context Integration**: Uses stored memory to personalize AI responses
  - **Manual Memory Editing**: Users can view and edit their memory in settings
  - **Memory Clearing**: Secure memory deletion with confirmation dialogs
- **Enhanced Chat Interface with Advanced Features**
  - **Message Layout**: User messages on right, AI messages on left for better conversation flow
  - **Message Actions**: Copy, like/dislike, regenerate buttons for each message
  - **Message Editing**: Users can edit their own messages with inline editing interface
  - **Message Regeneration**: Regenerate AI responses with improved context handling
  - **Conversation Management**: Delete and rename conversations with confirmation dialogs
  - **Improved Input Handling**: Continue typing while messages are being sent (input disabled only for sending)
  - **Visual Feedback**: Loading states, processing indicators, and improved message bubbles
  - **Accessibility**: Tooltips and keyboard shortcuts for all interactive elements
- **Model transparency features with real-time preview**
  - Live model preview in ChatInput showing which model will be used
  - Processing indicator during AI response generation
  - Model badges and FREE tier indicators in ChatMessage
  - Classification icons for different task types (code, writing, reasoning, analysis)
- **Enhanced user experience with visual feedback**
  - Real-time model selection based on prompt classification
  - Professional UI indicators for model usage
  - Clear visual distinction between free and paid features
- **Updated to use only free models for cost optimization**:
  - Code tasks: Qwen/Qwen2.5-Coder-32B-Instruct (free)
  - Writing tasks: Qwen/Qwen2.5-14B-Instruct (free)  
  - Reasoning tasks: DeepSeek/DeepSeek-R1-Distill-Qwen-32B (free)
  - Analysis tasks: Qwen/Qwen2.5-Coder-32B-Instruct (free)
- **Improved error handling and user feedback**
- **Enhanced security with proper server-side API authentication**

### Fixed
- **Critical Node.js Module Compatibility Issue**: Fixed "Module not found: Can't resolve 'net'" error
  - Moved all Firebase Admin SDK imports to server-side only
  - Created separate `/api/subscription` endpoint for subscription operations
  - Extracted PLANS configuration to shared constants file
  - Eliminated client-side imports of server-side modules
  - Fixed browser compatibility issues with Firebase Admin SDK
- **Security Enhancement**: Switched from client-side to server-side OpenRouter API access
  - Moved OpenRouter API calls from ChatInterface to /api/chat endpoint
  - Added Firebase ID token authentication for API requests
  - Eliminated need for NEXT_PUBLIC_OPENROUTER_API_KEY and browser exposure
  - Resolved OpenAI SDK browser blocking issues
  - Maintained all model transparency and classification features
- **Removed Debug Console Logs**: Cleaned up all console.log statements while preserving error logging
- **User creation issue where new users weren't automatically added to Firestore**
- **TypeScript errors in stripe.ts due to outdated API version**
- **Null database instance checks in all Stripe functions**
- **OpenRouter API key access and browser security issues**

## [Previous] - 2024-01-XX

### Added
- Initial project setup with Next.js App Router
- Firebase Firestore integration for data storage
- Firebase Authentication with email/password
- OpenRouter API integration for AI chat
- Stripe integration with free/pro tiers (10 prompts/day free)
- Chat interface with real-time messaging
- User dashboard and settings pages
- Responsive design with Tailwind CSS
- Complete authentication flow
- Usage tracking and limits
- Conversation management
- LangChain integration for memory management

## [0.1.1] - 2024-01-XX

### Added
- **Model transparency**: Now shows which AI model is handling each message
- **Real-time model preview**: Shows which model will be used while typing based on message content
- **Free model indicators**: Clear "FREE" badges for all free models
- **Task classification icons**: Visual icons for different types of tasks (code, writing, reasoning, analysis)
- **Model selection during processing**: Shows current model being used while AI is thinking

### Fixed
- **User not found error**: Fixed critical bug where new users would get "User not found" error when trying to send messages
- **Updated to free models**: Switched to completely free OpenRouter models (Qwen3, DeepSeek R1)
- Added automatic user document creation when users sign in for the first time
- Users are now automatically assigned to free tier with default usage limits (10 prompts/day)

### Updated Models
- **Code tasks**: Now uses Qwen3 30B (free)
- **Writing tasks**: Now uses Qwen3 14B (free) 
- **Reasoning tasks**: Now uses DeepSeek R1 (free)
- **Analysis tasks**: Now uses Qwen3 30B (free)
- **Default fallback**: Qwen3 14B (free)

### Technical Details
- Added `ensureUserExists` helper function in ChatInterface component
- User documents are created with default structure: free plan, 10 prompts/day limit, current period
- Both usage limit checking and message submission now ensure user document exists before proceeding
- Enhanced ChatMessage component with model badges and classification icons
- Added real-time model preview in ChatInput component
- Improved error handling and API key debugging for OpenRouter

## [0.1.0] - 2023-06-26

### Added
- Initial project setup with Next.js App Router
- Firebase authentication (Google OAuth and Email link)
- OpenRouter API integration for model routing
- LangChain integration for conversation memory
- Stripe integration for subscription management
- User interface components:
  - Authentication forms
  - Chat interface with message streaming
  - Dashboard layout with sidebar
  - Settings pages for user profile and subscription
- API endpoints:
  - Chat processing
  - Subscription management
  - Stripe webhook handler
  - Session management
  - Waitlist submission

### Implemented Pages
- Landing page with product information and waitlist form
- Authentication pages (login and email sign-in)
- Dashboard with chat interface
- Settings pages for user profile, subscription, and usage statistics

### Technical Implementation
- Firebase Client and Admin SDK setup
- Firestore database schema for users, conversations, and messages
- Session-based authentication using cookies
- Model routing based on prompt classification
- Usage tracking and limits based on subscription tier
- Stripe integration for payment processing

### Next Steps
- Add unit and integration tests
- Implement better error handling
- Add user profile avatar upload
- Create mobile-responsive versions of all components
- Implement export functionality for chat history 