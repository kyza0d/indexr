"use client";

import { useEffect, useState } from "react";

import { useSettings } from "@/components/settings/context";
import { ConfigType } from "@/types";
import { useTheme } from "next-themes";

const layout_options = [
  "Grid View",
  "List View",
  "Detail View",
  "Card View",
  "Table View",
  "Compact View",
  "Tile View",
];

const thumbnail_types = ["plain-text", "image"];

const SettingsWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isSaved, setIsSaved] = useState(false);

  const { config, setConfig } = useSettings();
  const [updatedConfig, setUpdatedConfig] = useState(config);

  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    let newValue =
      event.target instanceof HTMLInputElement && type === "checkbox" ? event.target.checked : value;

    setUpdatedConfig((prevState: ConfigType) => {
      let updatedState = { ...prevState };

      if (prevState.keys && name in prevState.keys) {
        // Ensure keys exists before accessing
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

  const saveConfig = () => {
    setConfig(updatedConfig);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-10">
      <div className="p-6 border border-gray-300 dark:border-gray-700 rounded shadow w-[60vw] h-[90vh] mt-10 bg-white dark:bg-[#1C2023]">
        <h1 className="font-medium mb-4">Settings</h1>

        <h2>Display Appearance</h2>

        <hr className="my-2 mb-4 border-t border-gray-400" />

        <div className="mb-2 flex items-center">
          <p>Thumbnail Key:</p>
          <div className="mb-4">
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

        <div className="mb-2 flex items-center">
          <p>Thumbnail Type:</p>
          <div className="mb-4">
            <select
              name="thumbnailType"
              value={updatedConfig.thumbnailType}
              onChange={handleChange}
              className="outline outline-1 outline-[#B2B2B2] px-4 pr-8 h-12 -outline-offset-1 ml-4"
            >
              {thumbnail_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-2 flex items-center">
          <div className="h-full bg-[#888888]"></div>
        </div>

        <div className="mb-4 flex items-center">
          <p className="mr-3">Show Key:</p>
          <div>
            <input
              type="checkbox"
              name="showKey"
              checked={updatedConfig.showKey}
              onChange={handleChange}
            />
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
              <input
                type="checkbox"
                id={key}
                name={key}
                checked={value as boolean}
                onChange={handleChange}
              />
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
            className="outline outline-1 outline-[#B2B2B2] -outline-offset-1 px-4 pr-8 h-12"
          >
            <option onClick={() => setTheme("system")} value="system">
              System
            </option>
            <option onClick={() => setTheme("light")} value="light">
              Light
            </option>
            <option onClick={() => setTheme("dark")} value="dark">
              Dark
            </option>
          </select>
        </div>

        <button
          onClick={saveConfig}
          className="px-4 py-3 outline outline-1 outline-[#B2B2B2] -outline-offset-1 mr-4"
        >
          {isSaved ? "Settings saved!" : "Save"}
        </button>

        <button
          onClick={onClose}
          className="px-4 py-3 outline outline-1 outline-[#B2B2B2] -outline-offset-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsWindow;
