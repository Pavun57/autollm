import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle the message submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    onSubmit(message);
    setMessage("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Message the AI..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="min-h-[52px] resize-none"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isLoading}
          className="h-[52px] w-[52px] shrink-0"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-2 px-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
} 