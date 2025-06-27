import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SendHorizonal, Brain, Code, FileText, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { classifyPrompt, getModelForPrompt } from "@/lib/openrouter";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  currentModel?: string | null;
  currentClassification?: string | null;
}

export default function ChatInput({ 
  onSubmit, 
  isLoading, 
  disabled = false,
  currentModel,
  currentClassification 
}: ChatInputProps) {
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
    
    if (!message.trim() || isLoading || disabled) return;
    
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

  // Format model name for display
  const formatModelName = (model: string) => {
    if (model.includes("qwen3-30b-a3b:free")) return "Qwen3 30B";
    if (model.includes("qwen3-14b:free")) return "Qwen3 14B";
    if (model.includes("deepseek-r1:free")) return "DeepSeek R1";
    return model;
  };

  // Get classification icon
  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'code':
        return <Code className="h-3 w-3" />;
      case 'writing':
        return <FileText className="h-3 w-3" />;
      case 'reasoning':
        return <Brain className="h-3 w-3" />;
      case 'analysis':
        return <BarChart3 className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  // Get model preview for current message
  const getModelPreview = () => {
    // If we're currently processing, show the current model being used
    if (isLoading && currentModel && currentClassification) {
      return {
        model: formatModelName(currentModel),
        classification: currentClassification,
        icon: getClassificationIcon(currentClassification),
        isFree: currentModel.includes(":free"),
        isProcessing: true
      };
    }

    // Otherwise, show prediction for current input
    if (!message.trim()) return null;
    
    const classification = classifyPrompt(message);
    const model = getModelForPrompt(message);
    
    return {
      model: formatModelName(model),
      classification,
      icon: getClassificationIcon(classification),
      isFree: model.includes(":free"),
      isProcessing: false
    };
  };

  const modelPreview = getModelPreview();

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder={disabled ? "Usage limit reached. Please upgrade to continue." : "Message the AI..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="min-h-[52px] resize-none"
            rows={1}
          />
          
          {/* Model preview */}
          {modelPreview && (
            <div className="flex items-center gap-2 mt-2 px-2">
              {modelPreview.isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">Processing with:</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Will use:</span>
              )}
              <Badge variant="outline" className="text-xs">
                {modelPreview.icon}
                <span className="ml-1">{modelPreview.model}</span>
                {modelPreview.isFree && (
                  <span className="ml-1 text-green-600">FREE</span>
                )}
              </Badge>
              <span className="text-xs text-muted-foreground">
                for {modelPreview.classification}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isLoading || disabled}
          className="h-[52px] w-[52px] shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground px-2">
        {disabled 
          ? "Upgrade to Pro to continue chatting"
          : isLoading 
            ? "You can continue typing your next message..."
            : "Press Enter to send, Shift+Enter for new line"
        }
      </p>
    </div>
  );
} 