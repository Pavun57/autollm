import React from "react";
import { useBYOK } from "@/components/BYOKProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Settings } from "lucide-react";

export function ApiKeyManager() {
  const { apiKey, setApiKey, removeApiKey } = useBYOK();
  const [keyInput, setKeyInput] = React.useState(apiKey || "");

  const handleSave = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <KeyRound className="mr-2 h-4 w-4" />
          <span>API Key</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenRouter API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your key is stored only in your browser. It is not sent to our servers.
          </p>
          <Input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-or-v1-..."
            type="password"
          />
          <div className="flex justify-end gap-2">
            <Button variant="destructive" onClick={removeApiKey}>Remove</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 