import { createContext, useContext } from "react";
import { ConfigType, SettingsContextType } from "@/types";

export const initialSettings: ConfigType = {
  thumbnailKey: "No Thumbnail",
  thumbnailType: "text",

  layout: "Grid View",
  showKey: true,
  searchKey: "id",
  theme: "Light",
  keys: {},
};

export const SettingsContext = createContext<SettingsContextType>({
  config: initialSettings,
  setConfig: () => { },

  keys: {},
  setKeys: () => { },
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
