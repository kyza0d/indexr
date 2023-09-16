"use client";

import { useEffect, useRef, useState } from "react";

import { IoIosCloseCircleOutline } from "react-icons/io";

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

const thumbnail_types = ["text", "image"];

const SettingsWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { config, setConfig } = useSettings();
  const [updatedConfig, setUpdatedConfig] = useState(config);

  useEffect(() => {
    if (settingsWindowRef.current !== null) {
      const rect = settingsWindowRef.current.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      const initialLeft = (innerWidth - rect.width) / 2;
      const initialTop = (innerHeight - rect.height) / 2;

      settingsWindowRef.current.style.left = `${initialLeft}px`;
      settingsWindowRef.current.style.top = `${initialTop}px`;
    }
  }, []);

  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  const isCheckboxInput = (
    element: HTMLInputElement | HTMLSelectElement,
    type: string
  ): element is HTMLInputElement => {
    return element instanceof HTMLInputElement && type === "checkbox";
  };

  const updateStateKeys = (prevState: ConfigType, name: string, value: any): ConfigType => {
    if (!prevState.keys) return prevState;

    const newKeys = Object.assign({}, prevState.keys);
    newKeys[name] = value;

    return Object.assign({}, prevState, {
      keys: newKeys,
    });
  };

  const updateState = (prevState: ConfigType, name: string, value: any): ConfigType => {
    return Object.assign({}, prevState, {
      [name]: value,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const updatedValue = isCheckboxInput(event.target, type) ? event.target.checked : value;

    const newConfig =
      updatedConfig.keys && name in updatedConfig.keys
        ? updateStateKeys(updatedConfig, name, updatedValue)
        : updateState(updatedConfig, name, updatedValue);

    setUpdatedConfig(newConfig);
    setConfig(newConfig);
  };

  const [isSaved, setIsSaved] = useState(false);

  const saveConfig = () => {
    setConfig(updatedConfig);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const { setTheme } = useTheme();

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => setDragging(false), { once: true });
    }

    return () => {
      if (dragging) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) {
      document.body.style.userSelect = "";
    }
  }, [dragging]);

  const settingsWindowRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    if (settingsWindowRef.current !== null) {
      let offsetX = event.clientX - settingsWindowRef.current.getBoundingClientRect().left;
      let offsetY = event.clientY - settingsWindowRef.current.getBoundingClientRect().top;

      setOffset({ offsetX, offsetY }); // Store offsets in state

      setDragging(true);
      document.body.style.userSelect = "none";
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    let clientX = event.clientX - offset.offsetX;
    let clientY = event.clientY - offset.offsetY;

    if (settingsWindowRef.current !== null) {
      const { width, height } = settingsWindowRef.current.getBoundingClientRect();

      // Boundary checks
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;

      if (clientX < 0) {
        clientX = 0;
      } else if (clientX + width > maxWidth) {
        clientX = maxWidth - width;
      }

      if (clientY < 0) {
        clientY = 0;
      } else if (clientY + height > maxHeight) {
        clientY = maxHeight - height;
      }

      settingsWindowRef.current.style.left = `${clientX}px`;
      settingsWindowRef.current.style.top = `${clientY}px`;

      setOffset({ offsetX: event.clientX - clientX, offsetY: event.clientY - clientY }); // Update offsets
    }
  };

  return (
    <>
      {dragging && <div className="fixed z-10 inset-0" style={{ pointerEvents: "none" }}></div>}

      <div
        ref={settingsWindowRef}
        style={{ position: "fixed", left: "0", top: "0" }}
        className="border border-gray-300 dark:border-gray-700 rounded shadow fixed w-[50vw] bg-white dark:bg-[#1C2023] "
      >
        <div
          className="cursor-move dark:bg-gray-800 bg-gray-400 flex items-center p-2"
          onMouseDown={handleMouseDown}
        >
          <button onClick={onClose} className="ml-auto">
            <IoIosCloseCircleOutline size={30} />
          </button>
        </div>

        <div className="p-4">
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
            className="px-4 py-3 outline outline-1 outline-[#B2B2B2] -outline-offset-1 mr-4 bg-blue-400 dark:bg-blue-600 px-8"
          >
            {isSaved ? "Settings saved!" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsWindow;
