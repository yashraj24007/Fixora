import React, { createContext, useContext, useState, useEffect } from 'react';

type AIMode = 'api' | 'local-model';

interface AIModeContextType {
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;
}

const AIModeContext = createContext<AIModeContextType | undefined>(undefined);

export function AIModeProvider({ children }: { children: React.ReactNode }) {
  const [aiMode, setAIModeState] = useState<AIMode>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('fixora-ai-mode');
    return (saved as AIMode) || 'api';
  });

  const setAIMode = (mode: AIMode) => {
    setAIModeState(mode);
    localStorage.setItem('fixora-ai-mode', mode);
  };

  return (
    <AIModeContext.Provider value={{ aiMode, setAIMode }}>
      {children}
    </AIModeContext.Provider>
  );
}

export function useAIMode() {
  const context = useContext(AIModeContext);
  if (context === undefined) {
    throw new Error('useAIMode must be used within an AIModeProvider');
  }
  return context;
}
