import { Message } from './firebase';

// Simple message types
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Simple memory class to store conversation history
export class ConversationMemory {
  private messages: ChatMessage[] = [];

  constructor(initialMessages: ChatMessage[] = []) {
    this.messages = [...initialMessages];
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  addUserMessage(content: string): void {
    this.addMessage({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.addMessage({ role: 'assistant', content });
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }
}

// Convert Firebase messages to our format
export function convertMessages(messages: Message[]): ChatMessage[] {
  return messages
    .map(message => {
      if (message.role === 'user' || message.role === 'assistant') {
        return {
          role: message.role,
          content: message.content
        };
      }
      return null;
    })
    .filter(Boolean) as ChatMessage[];
}

// Create memory from existing messages
export function createMemoryFromMessages(messages: Message[]): ConversationMemory {
  const convertedMessages = convertMessages(messages);
  return new ConversationMemory(convertedMessages);
}

// Add a message to memory
export function addMessageToMemory(memory: ConversationMemory, role: 'user' | 'assistant', content: string): void {
  if (role === 'user') {
    memory.addUserMessage(content);
  } else {
    memory.addAssistantMessage(content);
  }
}

// Get conversation history as array of messages
export function getConversationHistory(memory: ConversationMemory): ChatMessage[] {
  return memory.getMessages();
} 