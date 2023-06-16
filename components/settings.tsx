"use client";

import React, { ChangeEvent, createContext, useContext, useEffect, useState } from "react";

type SettingsContextType = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  keys: any;
  setKeys: React.Dispatch<React.SetStateAction<any>>;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const storedConfig = localStorage.getItem("settings");
    return {
      thumbnailKey: "code",
      showKey: true,
      keys: {},
      ...(storedConfig ? JSON.parse(storedConfig) : {}),
    };
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(config));
  }, [config]);

  return <SettingsContext.Provider value={{ config, setConfig }}>{children}</SettingsContext.Provider>;
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

  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setUpdatedConfig((prevState) => {
      if (name in prevState.keys) {
        return {
          ...prevState,
          keys: { ...prevState.keys, [name]: newValue },
        };
      }
      return {
        ...prevState,
        [name]: newValue,
      };
    });
  };

  const saveConfig = () => {
    setConfig(updatedConfig);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

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
