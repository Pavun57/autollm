import { useState } from "react";
import { Message } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  InfoIcon, 
  Brain, 
  Code, 
  FileText, 
  BarChart3, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Edit2, 
  Check, 
  X 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export default function ChatMessage({ 
  message, 
  onEdit, 
  onRegenerate, 
  onLike, 
  onDislike 
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const { toast } = useToast();
  
  const isUser = message.role === "user";
  const isAI = message.role === "assistant";
  
  // Format the model name for display
  const formatModelName = (model: string | undefined) => {
    if (!model) return "AI";
    
    // Handle new free models
    if (model.includes("qwen3-30b-a3b:free")) {
      return "Qwen3 30B";
    } else if (model.includes("qwen3-14b:free")) {
      return "Qwen3 14B";
    } else if (model.includes("qwen3-4b:free")) {
      return "Qwen3 4B";
    } else if (model.includes("deepseek-r1:free")) {
      return "DeepSeek R1";
    }
    
    // Extract model name from paths like 'anthropic/claude-3-sonnet'
    const parts = model.split("/");
    const modelName = parts[parts.length - 1];
    
    // Format model names nicely for paid models (fallback)
    if (modelName.includes("claude")) {
      return `Claude ${modelName.split("claude-")[1]}`;
    } else if (modelName.includes("gpt")) {
      return `GPT-${modelName.split("gpt-")[1]}`;
    } else if (modelName.includes("gemini")) {
      return `Gemini ${modelName.split("gemini-")[1]}`;
    }
    
    return modelName;
  };
  
  // Get icon for classification
  const getClassificationIcon = (classification: string | undefined) => {
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
        return <InfoIcon className="h-3 w-3" />;
    }
  };
  
  // Get badge color for different models
  const getModelBadgeColor = (model: string | undefined) => {
    if (!model) return "secondary";
    
    if (model.includes("qwen")) {
      return "default";
    } else if (model.includes("deepseek")) {
      return "destructive";
    } else if (model.includes("claude")) {
      return "secondary";
    } else if (model.includes("gpt")) {
      return "outline";
    }
    
    return "secondary";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message content.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      if (editContent.trim() !== message.content && onEdit) {
        onEdit(message.id, editContent.trim());
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleLike = () => {
    setLiked(!liked);
    setDisliked(false);
    if (onLike) {
      onLike(message.id);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    if (onDislike) {
      onDislike(message.id);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id);
    }
  };

  return (
    <div className={cn(
      "flex w-full gap-3 p-4 mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex gap-3 max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className="h-8 w-8 flex-shrink-0">
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
        
        <div className={cn(
          "flex-1 space-y-2",
          isUser ? "text-right" : "text-left"
        )}>
          <div className={cn(
            "flex items-center gap-2",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="text-sm font-medium">
              {isUser ? "You" : "AI Assistant"}
            </span>
            
            {!isUser && message.model && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getModelBadgeColor(message.model)}
                  className="text-xs font-normal"
                >
                  {formatModelName(message.model)}
                  {message.model.includes(":free") && (
                    <span className="ml-1 text-green-600">FREE</span>
                  )}
                </Badge>
                
                {message.metadata?.classification && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {getClassificationIcon(message.metadata.classification)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Task type: {message.metadata.classification}</p>
                        <p>Model: {message.model}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            "rounded-lg p-3 shadow-sm",
            isUser 
              ? "bg-primary text-primary-foreground ml-4" 
              : "bg-muted mr-4"
          )}>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                  placeholder="Edit your message..."
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Action buttons */}
          {!isEditing && message.content !== "..." && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isUser ? "justify-end" : "justify-start"
            )}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleCopy}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isUser && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleEdit}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {isAI && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0",
                            liked && "text-green-600"
                          )}
                          onClick={handleLike}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Like response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0",
                            disliked && "text-red-600"
                          )}
                          onClick={handleDislike}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dislike response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleRegenerate}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 