"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface KeyboardContextType {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
}

const KeyboardContext = createContext<KeyboardContextType>({
  isKeyboardOpen: false,
  keyboardHeight: 0,
});

export const useKeyboard = () => useContext(KeyboardContext);

interface KeyboardProviderProps {
  children: ReactNode;
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const heightDifference = windowHeight - viewportHeight;

      setIsKeyboardOpen(heightDifference > 150);
      setKeyboardHeight(heightDifference);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={{ isKeyboardOpen, keyboardHeight }}>
      {children}
    </KeyboardContext.Provider>
  );
}
