"use client";

import React, { ChangeEvent, createContext, useContext, useEffect, useState } from "react";

const layout_options = ["Grid View", "List View", "Detail View", "Card View", "Table View", "Compact View", "Tile View"];

type ConfigType = {
  thumbnailKey: string;
  showKey: boolean;
  layout: string;
  keys: { [key: string]: string | boolean };
};

type SettingsContextType = {
  config: ConfigType;
  setConfig: React.Dispatch<React.SetStateAction<any>>;

  keys: { [key: string]: string };
  setKeys: React.Dispatch<React.SetStateAction<any>>;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const storedConfig = localStorage.getItem("settings");
    return {
      thumbnailKey: "code",
      showKey: true,
      layout: "Grid View", // Default layout
      keys: {},
      ...(storedConfig ? JSON.parse(storedConfig) : {}),
    };
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(config));
  }, [config]);

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

const SettingsPane: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isSaved, setIsSaved] = useState(false);

  const { config, setConfig } = useSettings();

  const [updatedConfig, setUpdatedConfig] = useState(config);

  // Synchronize local and global config state
  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  // Handler for input changes
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
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
      className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center z-10"
      onClick={handleBackdropClick}
    >
      <div className="p-4 bg-white border border-gray-300 rounded shadow w-[60vw] h-[90vh] mt-6">
        <h1 className="font-medium mb-4">Settings</h1>

        <h2>Display Appearance</h2>

        <hr className="my-4 border-t border-gray-400" />

        <div className="mb-2 flex items-center">
          <p>Thumbnail Key:</p>
          <div>
            <input type="text" name="thumbnailKey" value={updatedConfig.thumbnailKey} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <p className="mr-3">Show Key:</p>
          <div>
            <input type="checkbox" name="showKey" checked={updatedConfig.showKey} onChange={handleChange} />
          </div>
        </div>

        <h2 className="mt-8">Shown Keys</h2>

        <hr className="my-2 border-t border-gray-400" />

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

        <hr className="my-4 border-t border-gray-400" />

        <div className="mb-4">
          <select name="layout" value={updatedConfig.layout} onChange={handleChange}>
            {layout_options.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={saveConfig}
          className={`px-4 py-2 rounded mr-3 ${isSaved ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
        >
          {isSaved ? "Settings saved!" : "Save"}
        </button>

        <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsPane;
