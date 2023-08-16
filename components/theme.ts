// theme.ts
import { useEffect } from "react";
import { useSettings } from "./settings";

export const useTheme = (): [string, (theme: string) => void] => {
  const { config, setConfig } = useSettings();

  // This useEffect will handle the synchronization between the config.theme and the theme class
  useEffect(() => {
    localStorage.setItem("theme", config.theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(config.theme);
  }, [config.theme]);

  const setTheme = (theme: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      theme,
    }));
  };

  return [config.theme, setTheme];
};
