import { useContext } from "react";

import { SettingsContext } from "@/components/settings";

const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default useSettings;
