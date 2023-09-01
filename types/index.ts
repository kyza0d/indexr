import React from "react";

export type SettingsContextType = {
  config: ConfigType;
  setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
  keys: { [key: string]: string };
  setKeys: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

export type ConfigType = {
  thumbnailKey: string;
  thumbnailType: "plain-text" | "url";
  showKey: boolean;
  layout: string;
  theme: string;
  keys: { [key: string]: unknown };
};
