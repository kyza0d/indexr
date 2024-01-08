import { useState } from "react";
import { SettingsContext, initialSettings } from "@/components/Settings/Context";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { value: config, setValue: setConfig } = useLocalStorage("settings", initialSettings);
  const [keys, setKeys] = useState<{ [key: string]: string }>({});

  return (
    <SettingsContext.Provider value={{ config, setConfig, keys, setKeys }}>
      {children}
    </SettingsContext.Provider>
  );
};
