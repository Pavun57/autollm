# AI SaaS App Implementation Plan

## 1. Project Structure

```
/app
  /api
    /auth/[...nextauth]
    /chat
    /subscription
    /webhooks/stripe
  /dashboard
    /page.tsx (main chat interface)
    /layout.tsx (sidebar + content)
    /chat/[id]
  /auth
    /login
    /email-signin
  /settings
/components
  /layout
    Navbar.tsx
    Sidebar.tsx
  /chat
    ChatInterface.tsx
    ChatInput.tsx
    ChatMessage.tsx
    ConversationList.tsx
  /subscription
    PlanCard.tsx
    UsageStats.tsx
  /auth
    AuthForm.tsx
/lib
  /firebase.ts
  /openrouter.ts
  /langchain.ts
  /stripe.ts
  /utils
    auth.ts
    chat.ts
    subscription.ts
  /db-schema
    users.ts
    conversations.ts
    messages.ts
```

## 2. Database Schema

### Users Collection
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'free' | 'pro';
  usage: {
    period: {
      start: Timestamp;
      end: Timestamp;
    };
    promptsUsed: number;
    promptsLimit: number;
  };
  stripeCustomerId?: string;
  createdAt: Timestamp;
}
```

### Conversations Collection
```typescript
interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

### Messages Collection
```typescript
interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: Timestamp;
  metadata?: {
    promptTokens?: number;
    completionTokens?: number;
    classification?: string;
  }
}
```

## 3. Authentication

### Authentication Methods
- Google OAuth login (primary)
- Email link (passwordless) login

### Firebase Auth Configuration
```typescript
// Google Auth setup
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Email Link setup
const actionCodeSettings = {
  url: 'https://yourapp.com/auth/email-signin',
  handleCodeInApp: true
};

const sendSignInLink = async (email) => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem('emailForSignIn', email);
};
```

### Authentication Routes
- `/auth/login` - Shows Google button and email input form
- `/auth/email-signin` - Handles email link redirects and authentication

## 4. UI Layout

### Navbar (Top)
- Logo (left)
- Profile dropdown (right)
  - User avatar/name
  - Settings link
  - Subscription management
  - Usage statistics
  - Logout option

### Sidebar (Left)
- New Chat button (top)
- Conversation history list
  - Title of each conversation
  - Timestamp/date grouping
  - Active conversation highlighting

### Main Content
- Current chat interface with message history
- Input box for new messages
- Model information display

## 5. Chat Interface Implementation

### LangChain Integration
- ConversationBufferMemory for context management
- Integration with Firestore for persistence
- Message history retrieval and display

### Message Flow
1. User sends message
2. Message stored in Firestore
3. System classifies message intent
4. OpenRouter API routes to appropriate model
5. Response stored in Firestore
6. UI updated with streamed response

### Model Routing Logic
- Simple keyword-based classifier:
  - code → anthropic/claude-3-sonnet
  - writing → openai/gpt-4-turbo
  - reasoning → google/gemini-pro
  - analysis → anthropic/claude-3-opus

## 6. Subscription System

### Plans
- Free tier: 10 prompts per day
- Pro tier: 100 prompts per month

### Stripe Integration
- Subscription creation and management
- Webhook handling for subscription events
- Update user plan in Firestore

### Usage Tracking
- Count prompts used per period (day/month)
- Update user document in Firestore
- Block submissions when limit reached

## 7. Key Components Implementation

### AuthForm.tsx
```typescript
const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const handleGoogleSignIn = async () => {
    // Google sign in logic
  };
  
  const handleEmailLink = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      await sendSignInLink(email);
      setSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="auth-form">
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
      
      <div className="divider">OR</div>
      
      {!sent ? (
        <form onSubmit={handleEmailLink}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Sign In Link'}
          </button>
        </form>
      ) : (
        <div className="success-message">
          Sign in link sent! Check your email.
        </div>
      )}
    </div>
  );
};
```

### ChatInterface.tsx
```typescript
const ChatInterface = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load conversation messages from Firestore
  }, [conversationId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Save message to Firestore
      // Check usage limits
      // Process with OpenRouter
      // Save response to Firestore
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <div className="loading-indicator">AI is thinking...</div>}
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Send a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
```

### Sidebar.tsx
```typescript
const Sidebar = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to conversations from Firestore
    const unsubscribe = firestore
      .collection('conversations')
      .where('userId', '==', user.uid)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        const convos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convos);
      });
      
    return unsubscribe;
  }, [user]);
  
  const createNewChat = async () => {
    // Create new conversation in Firestore
  };
  
  return (
    <div className="sidebar">
      <button onClick={createNewChat} className="new-chat-btn">
        New Chat
      </button>
      
      <div className="conversations-list">
        {conversations.map(convo => (
          <ConversationItem key={convo.id} conversation={convo} />
        ))}
        {conversations.length === 0 && (
          <div className="empty-state">No conversations yet</div>
        )}
      </div>
    </div>
  );
};
```

### Navbar.tsx
```typescript
const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="navbar">
      <div className="logo">AI SaaS</div>
      
      <div className="profile-section">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="avatar-button"
        >
          <img src={user?.photoURL || '/default-avatar.png'} alt="Profile" />
        </button>
        
        {isMenuOpen && (
          <div className="dropdown-menu">
            <div className="user-info">
              <div className="name">{user?.displayName || user?.email}</div>
              <div className="email">{user?.email}</div>
            </div>
            
            <div className="menu-items">
              <Link href="/settings">Settings</Link>
              <Link href="/settings/subscription">Subscription</Link>
              <Link href="/settings/usage">Usage Stats</Link>
              <button onClick={signOut}>Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
```

## 8. Implementation Phases

### Phase 1: Authentication & Core Structure
- Setup Firebase Auth with Google and Email Link
- Create basic page structure and routing
- Implement auth protection middleware
- Setup database schema in Firestore

### Phase 2: Chat Interface & History
- Create sidebar with conversation list
- Implement chat interface UI
- Setup message storage in Firestore
- Configure LangChain for conversation memory

### Phase 3: AI Integration & Routing
- Integrate OpenRouter API
- Implement model classification logic
- Setup message streaming
- Display model information with responses

### Phase 4: Subscriptions & Usage
- Implement usage tracking system
- Create subscription UI
- Integrate Stripe for payments
- Create usage limits and plan features

### Phase 5: Polish & Optimization
- Add proper error handling
- Implement loading states and feedback
- Optimize database queries
- Performance improvements

## 9. API Endpoints

### Chat Endpoint
```typescript
// POST /api/chat
// Body: { conversationId: string, message: string }
// Response: { id: string, role: string, content: string, model: string }
```

### Subscription Endpoint
```typescript
// POST /api/subscription
// Body: { plan: 'free' | 'pro' }
// Response: { sessionId: string } (for Stripe Checkout)
```

### Webhook Endpoint
```typescript
// POST /api/webhooks/stripe
// Handles subscription events from Stripe
```

## 10. Security & Best Practices

- Store API keys and secrets in environment variables
- Implement proper Firebase security rules
- Use server-side API route for OpenRouter calls
- Validate user session and permissions on API routes
- Rate limit API endpoints
- Implement error handling and logging 