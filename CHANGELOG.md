# Changelog

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