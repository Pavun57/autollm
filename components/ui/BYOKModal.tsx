import React, { useState } from "react";
import { useBYOK } from "@/components/BYOKProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BYOKModal({ open }: { open: boolean }) {
  const { setApiKey } = useBYOK();
  const [keyInput, setKeyInput] = useState("");

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your OpenRouter API Key</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            setApiKey(keyInput.trim());
          }}
          className="space-y-4"
        >
          <Input
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full"
            type="text"
            required
            autoFocus
          />
          <Button type="submit" className="w-full">Save Key</Button>
        </form>
        <div className="text-xs text-muted-foreground mt-2">
          Your key is stored only in your browser and never sent to our server.
        </div>
      </DialogContent>
    </Dialog>
  );
} 