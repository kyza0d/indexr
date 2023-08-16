"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const layout_options = ["Grid View", "List View", "Detail View", "Card View", "Table View", "Compact View", "Tile View"];

type SettingsContextType = {
  config: ConfigType;
  setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;

  keys: { [key: string]: string };
  setKeys: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

type ConfigType = {
  thumbnailKey: string;
  showKey: boolean;
  layout: string;
  theme: string; // Add theme property
  keys: { [key: string]: any };
};

export const SettingsContext = createContext<SettingsContextType>({
  config: {
    thumbnailKey: "No Thumbnail",
    layout: "Grid View",
    showKey: true,
    theme: "Light",
    keys: {},
  },

  keys: {},
  setConfig: () => { },
  setKeys: () => { },
});

function useLocalStorage(key: string, initialValue: any) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") return initialValue();
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return { value, setValue };
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialConfig = (() => {
    if (typeof window !== "undefined") {
      const storedConfig = localStorage.getItem("settings");
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
    }
    return {
      thumbnailKey: "No Thumbnail",
      showKey: true,
      layout: "Grid View",
      theme: "light",
      keys: {},
    };
  })();

  const { value: config, setValue: setConfig } = useLocalStorage("settings", initialConfig);

  useEffect(() => {
    const storedConfig = localStorage.getItem("settings");
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, []);

  const [keys, setKeys] = useState<{ [key: string]: string }>({});

  return <SettingsContext.Provider value={{ config, setConfig, keys, setKeys }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};

import { useTheme } from "./theme";

const SettingsPane: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [theme, setTheme] = useTheme();

  const [isSaved, setIsSaved] = useState(false);

  const { config, setConfig } = useSettings();
  const [updatedConfig, setUpdatedConfig] = useState(config);

  // Synchronize local and global config state
  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    let newValue = event.target instanceof HTMLInputElement && type === "checkbox" ? event.target.checked : value;

    setUpdatedConfig((prevState: ConfigType) => {
      let updatedState = { ...prevState };
      if (name in prevState.keys) {
        updatedState.keys = { ...prevState.keys, [name]: newValue };
      } else {
        updatedState = {
          ...prevState,
          [name]: newValue,
        };
      }
      return updatedState;
    });
  };

  // Handler for saving config
  const saveConfig = () => {
    setConfig(updatedConfig);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Handler for backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-10"
      onClick={handleBackdropClick}
    >
      <div className="p-2 border border-gray-300 dark:border-gray-700 rounded shadow w-[60vw] h-[90vh] mt-10 bg-white dark:bg-[#1C2023]">
        <h1 className="font-medium mb-4">Settings</h1>

        <h2>Display Appearance</h2>

        <hr className="my-2 mb-4 border-t border-gray-400" />

        <div className="mb-2 flex items-center">
          <p>Thumbnail Key:</p>
          <div>
            <select
              name="thumbnailKey"
              value={updatedConfig.thumbnailKey}
              onChange={handleChange}
              className="outline outline-1 outline-[#B2B2B2] px-4 pr-8 h-12 -outline-offset-1 ml-4"
            >
              <option value="">No Thumbnail</option> {/* Add this line */}
              {Object.keys(updatedConfig.keys).map((key) => (
                <option value={key} key={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <p className="mr-3">Show Key:</p>
          <div>
            <input type="checkbox" name="showKey" checked={updatedConfig.showKey} onChange={handleChange} />
          </div>
        </div>

        <h2 className="mt-8">Shown Keys:</h2>

        <hr className="my-2 mb-4 border-t border-gray-400" />

        {Object.entries(updatedConfig.keys).map(([key, value]) => (
          <div key={key} className="mb-2 flex items-center">
            <label htmlFor={key} className="mr-3">
              {key}:
            </label>
            <div>
              <input type="checkbox" id={key} name={key} checked={value as boolean} onChange={handleChange} />
            </div>
          </div>
        ))}

        <h2 className="mt-8">Layout:</h2>

        <hr className="my-2 mb-4 border-t border-gray-400" />

        <div className="mb-4">
          <select
            name="layout"
            value={updatedConfig.layout}
            onChange={handleChange}
            className="outline outline-1 outline-[#B2B2B2] -outline-offset-1 px-4 pr-8 h-12"
          >
            {layout_options.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <select
            name="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="outline outline-1 outline-[#B2B2B2] -outline-offset-1 px-4 pr-8 h-12"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button onClick={saveConfig} className="px-4 py-3 outline outline-1 outline-[#B2B2B2] -outline-offset-1 mr-4">
          {isSaved ? "Settings saved!" : "Save"}
        </button>

        <button onClick={onClose} className="px-4 py-3 outline outline-1 outline-[#B2B2B2] -outline-offset-1">
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsPane;
