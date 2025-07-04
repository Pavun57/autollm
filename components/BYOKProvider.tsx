'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BYOKContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  removeApiKey: () => void;
}

const BYOKContext = createContext<BYOKContextType | undefined>(undefined);

export const BYOKProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("openrouter_api_key");
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem("openrouter_api_key", key);
    setApiKeyState(key);
  };

  const removeApiKey = () => {
    localStorage.removeItem("openrouter_api_key");
    setApiKeyState(null);
  };

  return (
    <BYOKContext.Provider value={{ apiKey, setApiKey, removeApiKey }}>
      {children}
    </BYOKContext.Provider>
  );
};

export const useBYOK = () => {
  const ctx = useContext(BYOKContext);
  if (!ctx) throw new Error("useBYOK must be used within a BYOKProvider");
  return ctx;
}; 