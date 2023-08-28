import React from "react";

export type ConfigType = {
  thumbnailKey: string;
  showKey: boolean;
  layout: string;
  theme: string;
  keys: { [key: string]: unknown };
};

export type SettingsContextType = {
  config: ConfigType;
  setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
  keys: { [key: string]: string };
  setKeys: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};
