"use client"

import { useState } from "react";
import { SettingsContext } from "@/components/settings/context";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { value: config, setValue: setConfig } = useLocalStorage('sessionData', {});

  const [keys, setKeys] = useState<{ [key: string]: string }>({});

  return (
    <SettingsContext.Provider value={{ config, setConfig, keys, setKeys }}>
      {children}
    </SettingsContext.Provider>
  );
};
