import { Message } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  // Format the model name for display
  const formatModelName = (model: string | undefined) => {
    if (!model) return "AI";
    
    // Extract model name from paths like 'anthropic/claude-3-sonnet'
    const parts = model.split("/");
    const modelName = parts[parts.length - 1];
    
    // Format model names nicely
    if (modelName.includes("claude")) {
      return `Claude ${modelName.split("claude-")[1]}`;
    } else if (modelName.includes("gpt")) {
      return `GPT-${modelName.split("gpt-")[1]}`;
    } else if (modelName.includes("gemini")) {
      return `Gemini ${modelName.split("gemini-")[1]}`;
    }
    
    return modelName;
  };
  
  return (
    <div className={cn(
      "flex w-full gap-3 p-4 rounded-lg",
      isUser ? "bg-muted" : "bg-background",
    )}>
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/placeholder-logo.svg" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? "You" : "AI Assistant"}
          </span>
          
          {!isUser && message.model && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    {formatModelName(message.model)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Responded by {message.model}</p>
                  {message.metadata?.classification && (
                    <p>Classified as: {message.metadata.classification}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content === "..." ? (
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
            </div>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
} 