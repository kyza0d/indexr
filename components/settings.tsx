"use client";

import React, { ChangeEvent, createContext, useContext, useEffect, useState } from "react";

export const SettingsContext = createContext<any>(null);

// Create a provider component to wrap the app and provide the settings context
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState(() => {
    // Get the stored settings from local storage, or use the default values
    const storedConfig = localStorage.getItem("settings");
    return storedConfig
      ? JSON.parse(storedConfig)
      : {
        thumbnailKey: "code",
        showKey: true,
      };
  });

  useEffect(() => {
    // Save the settings to local storage whenever they change
    localStorage.setItem("settings", JSON.stringify(config));
  }, [config]);

  return <SettingsContext.Provider value={{ config, setConfig }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);

const SettingsPane = ({ onClose }: { onClose: () => void }) => {
  const { config, setConfig } = useSettings();

  const [updatedConfig, setUpdatedConfig] = useState(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setUpdatedConfig({ ...updatedConfig, [name]: newValue });
  };

  const saveConfig = () => {
    setConfig(updatedConfig);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000); // Reset isSaved state after 2 seconds (2000 milliseconds)
  };

  const handleCloseWindow = () => {
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCloseWindow();
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

        <hr className="my-2 mb-8 border-t border-gray-400" />

        <div className="mb-2 flex items-center">
          <h1 className="font-medium mr-3">Thumbnail Key:</h1>
          <div>
            <input type="text" name="thumbnailKey" value={updatedConfig.thumbnailKey} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-2 flex items-center">
          <h1 className="font-medium mr-3">Show Key:</h1>
          <div>
            <input type="checkbox" name="showKey" checked={updatedConfig.showKey} onChange={handleChange} />
          </div>
        </div>

        <button
          onClick={saveConfig}
          className={`px-4 py-2 rounded mr-3 ${isSaved ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
        >
          {isSaved ? "Settings saved!" : "Save"}
        </button>

        <button onClick={handleCloseWindow} className="px-4 py-2 bg-blue-500 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsPane;
