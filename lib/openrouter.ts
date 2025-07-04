import { OpenAI } from 'openai';
import { Message } from './firebase';

// Initialize OpenAI client with OpenRouter base URL
// Check both server-side and client-side environment variables
const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

console.log("OpenRouter API Key status:", {
  hasKey: Boolean(apiKey),
  keyLength: apiKey ? apiKey.length : 0,
  keyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found',
  isClientSide: typeof window !== 'undefined',
  usingPublicKey: Boolean(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)
});

// Warning about using public API key
if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY && typeof window !== 'undefined') {
  console.warn("⚠️  WARNING: Using NEXT_PUBLIC_OPENROUTER_API_KEY exposes your API key to the client. This is only acceptable for development or free API keys.");
}

const openai = apiKey ? new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "AutoLLM AI App",
  },
}) : null;

// Model mappings by classification - using FREE models only
const MODEL_MAPPINGS = {
  code: 'qwen/qwen3-30b-a3b:free', // Good for coding tasks
  writing: 'qwen/qwen3-14b:free', // Good for writing tasks
  reasoning: 'deepseek/deepseek-r1:free', // Excellent for reasoning
  analysis: 'qwen/qwen3-30b-a3b:free', // Good for analysis
  default: 'qwen/qwen3-14b:free', // Fallback model
};

// Simple keyword-based prompt classifier
export function classifyPrompt(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // Classification logic
  if (/\b(code|function|class|program|algorithm|script|syntax|programming language|api|framework)\b/.test(promptLower)) {
    return 'code';
  } else if (/\b(write|essay|blog|article|content|story|description|paragraph|summary|summarize|rephrase)\b/.test(promptLower)) {
    return 'writing';
  } else if (/\b(reason|logic|explain|why|how|concept|understand|inference|deduce|conclude)\b/.test(promptLower)) {
    return 'reasoning';
  } else if (/\b(analyze|compare|evaluate|assess|review|examine|investigate|report|data|statistics|metrics|performance)\b/.test(promptLower)) {
    return 'analysis';
  }
  
  return 'default';
}

// Get the appropriate model based on prompt classification
export function getModelForPrompt(prompt: string): string {
  const classification = classifyPrompt(prompt);
  return MODEL_MAPPINGS[classification as keyof typeof MODEL_MAPPINGS] || MODEL_MAPPINGS.default;
}

// Format messages for API call
function formatMessages(conversationHistory: Message[]) {
  return conversationHistory.map(message => {
    return {
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content
    };
  });
}

// Main function to process a chat completion
export async function processChat(
  conversationHistory: Message[],
  prompt?: string,
  apiKey?: string
): Promise<{ content: string; model: string; classification: string; usage: { promptTokens: number, completionTokens: number } }> {
  try {
    if (!apiKey) {
      throw new Error("OpenRouter API key is missing. Please provide your key in settings.");
    }
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AutoLLM AI App",
      },
    });
    
    // If a new prompt is provided, classify and add to history
    const classification = prompt ? classifyPrompt(prompt) : 'default';
    const modelId = MODEL_MAPPINGS[classification as keyof typeof MODEL_MAPPINGS];
    
    console.log(`Using model: ${modelId} for classification: ${classification}`);
    
    const messages = formatMessages(conversationHistory);
    
    // Call OpenRouter API through OpenAI client
    const completion = await openai.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
    });
    
    const content = completion.choices[0]?.message.content || "No response generated.";
    
    return {
      content,
      model: modelId,
      classification,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw new Error("Failed to process chat completion");
  }
}

// Stream version for real-time responses
export async function processChatStream(
  conversationHistory: Message[],
  prompt?: string,
  apiKey?: string
) {
  try {
    if (!apiKey) {
      throw new Error("OpenRouter API key is missing. Please provide your key in settings.");
    }
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AutoLLM AI App",
      },
    });
    
    const classification = prompt ? classifyPrompt(prompt) : 'default';
    const modelId = MODEL_MAPPINGS[classification as keyof typeof MODEL_MAPPINGS];
    
    console.log(`Using model: ${modelId} for classification: ${classification}`);
    
    const messages = formatMessages(conversationHistory);
    
    // Call OpenRouter API with streaming enabled
    const stream = await openai.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
      stream: true,
    });
    
    return {
      stream,
      model: modelId,
      classification,
    };
  } catch (error) {
    console.error("Error calling OpenRouter API stream:", error);
    throw new Error("Failed to process streaming chat completion");
  }
} 